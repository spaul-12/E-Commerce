package router

import (
	//"fmt"

	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"

	//"math/rand"
	"net/http"
	"time"

	"main.go/config"
	db "main.go/database"
	"main.go/models"
	"main.go/util"

	"golang.org/x/crypto/bcrypt"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"

	"github.com/dgrijalva/jwt-go"
	"github.com/gofiber/fiber/v2"
	"github.com/lib/pq"
)

var jwtKey = []byte("key")

//variables required for google authentication
var (
	googleOauthConfig = &oauth2.Config{
		RedirectURL:  "http://localhost:8000/api/user/googlecallback",
		ClientID:     config.Config("GOOGLE_CLIENT_ID"),
		ClientSecret: config.Config("GOOGLE_CLIENT_SECRET"),
		Scopes: []string{"https://www.googleapis.com/auth/userinfo.email",
			"https://www.googleapis.com/auth/userinfo.profile",
		},
		Endpoint: google.Endpoint,
	}
	randomstate    = "random-state"
	googlepassword = "gpasswd"
)

// CreateUser route registers a User into the database
func CreateUser(c *fiber.Ctx) error {
	u := new(models.User)

	if err := c.BodyParser(u); err != nil {

		return c.JSON(fiber.Map{
			"error": true,
			"input": "Please review your input",
		})
	}

	// validate if the email, username and password are in correct format
	errors := util.ValidateRegister(u)
	if errors.Err {
		return c.JSON(errors)
	}

	if count := db.DB.Where(&models.User{Email: u.Email}).First(new(models.User)).RowsAffected; count > 0 {
		errors.Err, errors.Email = true, "Email is already registered"
	}
	if count := db.DB.Where(&models.User{Username: u.Username}).First(new(models.User)).RowsAffected; count > 0 {
		errors.Err, errors.Username = true, "Username is already registered"
	}
	if errors.Err {
		return c.JSON(errors)
	}

	// Hashing the password with a random salt
	password := []byte(u.Password)
	hashedPassword, err := bcrypt.GenerateFromPassword(
		password,
		8,
	)

	if err != nil {
		panic(err)
	}
	u.Password = string(hashedPassword)

	if err := db.DB.Create(&u).Error; err != nil {
		return c.JSON(fiber.Map{
			"error":   true,
			"general": "Something went wrong, please try again later. 😕",
		})
	}

	//redirect to home
	return c.JSON(errors)
}

// LoginUser route logins a user in the app
func LoginUser(c *fiber.Ctx) error {
	type LoginInput struct {
		Identity string `json:"identity"`
		Password string `json:"password"`
	}

	input := new(LoginInput)

	if err := c.BodyParser(input); err != nil {
		return c.JSON(fiber.Map{"redirected": false, "url": "", "msg": "Please review your input"})
	}

	if input.Password == googlepassword {
		return c.JSON(fiber.Map{"redirected": false, "url": "", "msg": "Invalid Credentials."})
	}

	u := new(models.User)
	if res := db.DB.Where(
		&models.User{Email: input.Identity}).Or(
		&models.User{Username: input.Identity},
	).First(&u); res.RowsAffected <= 0 {
		return c.JSON(fiber.Map{"redirected": false, "url": "", "msg": "Invalid Credentials."})
	}

	// Comparing the password with the hash
	if err := bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(input.Password)); err != nil {
		return c.JSON(fiber.Map{"redirected": false, "url": "", "msg": "Incorrect Password"})
	}

	// setting up the authorization cookies
	accessToken := util.GenerateTokens(u.Username)
	accessCookie := util.GetAuthCookies(accessToken)
	c.Cookie(accessCookie)
	c.Cookie(&fiber.Cookie{
		Name:     "username",
		Value:    u.Username,
		HTTPOnly: true,
		Secure:   true,
	})

	//redirect to private route
	return c.Redirect("/api/user/private/", 301)

}

//this function logs out a user and reset the accesscookie to nil
func Logout(c *fiber.Ctx) error {
	c.ClearCookie()

	c.Cookie(&fiber.Cookie{
		Name:     "access_token",
		Value:    "0000",
		Expires:  time.Now().Add(1 * time.Second),
		HTTPOnly: true,
		Secure:   true,
	})

	return nil
}

// GetAccessToken generates and sends a new access token iff there is a valid refresh token
func GetAccessToken(c *fiber.Ctx) error {
	type RefreshToken struct {
		RefreshToken string `json:"refresh_token"`
	}

	reToken := new(RefreshToken)
	if err := c.BodyParser(reToken); err != nil {
		return c.JSON(fiber.Map{"error": true, "input": "Please review your input"})
	}

	refreshToken := reToken.RefreshToken

	refreshClaims := new(models.Claims)
	token, _ := jwt.ParseWithClaims(refreshToken, refreshClaims,
		func(token *jwt.Token) (interface{}, error) {
			return jwtKey, nil
		})

	if res := db.DB.Where(
		"expires_at = ? AND issued_at = ? AND issuer = ?",
		refreshClaims.ExpiresAt, refreshClaims.IssuedAt, refreshClaims.Issuer,
	).First(&models.Claims{}); res.RowsAffected <= 0 {
		// no such refresh token exist in the database
		c.ClearCookie("access_token", "refresh_token")
		return c.SendStatus(fiber.StatusForbidden)
	}

	if token.Valid {
		if refreshClaims.ExpiresAt < time.Now().Unix() {
			// refresh token is expired
			c.ClearCookie("access_token", "refresh_token")
			return c.SendStatus(fiber.StatusForbidden)
		}
	} else {
		// malformed refresh token
		c.ClearCookie("access_token", "refresh_token")
		return c.SendStatus(fiber.StatusForbidden)
	}

	_, accessToken := util.GenerateAccessClaims(refreshClaims.Issuer)

	c.Cookie(&fiber.Cookie{
		Name:     "access_token",
		Value:    accessToken,
		Expires:  time.Now().Add(24 * time.Hour),
		HTTPOnly: true,
		Secure:   true,
	})

	return c.JSON(fiber.Map{"access_token": accessToken})
}

//funtion to get bookstock
func GetBookStock(c *fiber.Ctx) error {
	type Bookdata struct {
		Bookid   uint32
		Bookname string
		Quantity uint32
		Price    uint64
	}

	var Books []Bookdata
	var Book Bookdata
	var Catagories []string
	catlist := make(map[string]bool)
	var book models.BookStock

	rows, _ := db.DB.Model(&models.BookStock{}).Rows()
	defer rows.Close()
	for rows.Next() {
		db.DB.ScanRows(rows, &book)
		Book.Bookid = book.Bookid
		Book.Bookname = book.Bookname
		Book.Quantity = book.Quantity
		Book.Price = book.Price
		for _, e := range book.Catagory {
			catlist[e] = true
		}
		if Book.Quantity > 0 {
			Books = append(Books, Book)
		}
	}

	for cat := range catlist {
		Catagories = append(Catagories, cat)
	}

	// fmt.Println(Books)
	// fmt.Println(Catagories)

	return c.JSON(fiber.Map{
		"books":      Books,
		"catagories": Catagories,
	})
}

//function for catagory wise sorting
func CreateCatagoryCookie(c *fiber.Ctx) error {
	type catagoryinput struct {
		Catagory string `json:"catagory"`
	}
	input := new(catagoryinput)
	if err := c.BodyParser(input); err != nil {
		fmt.Println("Parsing error")
		return c.JSON(fiber.Map{
			"error": true,
		})
	}
	c.Cookie(&fiber.Cookie{
		Name:     "bookcatagory",
		Value:    input.Catagory,
		HTTPOnly: true,
		Secure:   true,
	})

	return c.JSON(fiber.Map{
		"error": false,
	})
}

func Getfilteredbooks(c *fiber.Ctx) error {
	cat := c.Cookies("bookcatagory")
	var catagory pq.StringArray
	catagory = append(catagory, cat)

	type Bookdata struct {
		Bookid   uint32
		Bookname string
		Quantity uint32
		Price    uint64
	}

	var Books []Bookdata
	var Book Bookdata

	rows, _ := db.DB.Model(&models.BookStock{}).Select("bookid", "bookname", "quantity", "price").Where("catagory && ?", pq.StringArray(catagory)).Rows()
	defer rows.Close()
	for rows.Next() {
		db.DB.ScanRows(rows, &Book)
		if Book.Quantity > 0 {
			Books = append(Books, Book)
		}
	}

	fmt.Println(Books)

	return c.JSON(Books)
}

// GetUsername returns the username of the user signed in
func GetUsername(c *fiber.Ctx) error {
	u := c.Cookies("username")
	return c.JSON(u)
}

/*
   These functions are required for google login
*/

//function for google login
func GoogleLogin(c *fiber.Ctx) error {
	url := googleOauthConfig.AuthCodeURL(randomstate)
	return c.Redirect(url)
}

//function for google callback
func GoogleCallback(c *fiber.Ctx) error {

	if c.FormValue("state") != randomstate {
		fmt.Println("state not valid")
		return nil
	}

	token, err := googleOauthConfig.Exchange(context.Background(), c.Query("code"))
	if err != nil {
		fmt.Println("couldnot get token")
		fmt.Println(err.Error())
		return nil
	}

	response, err := http.Get("https://www.googleapis.com/oauth2/v2/userinfo?access_token=" + token.AccessToken)
	if err != nil {
		fmt.Println("could not create get request")
		return nil
	}

	defer response.Body.Close()
	content, err := ioutil.ReadAll(response.Body)
	if err != nil {
		fmt.Println("couldnot read response")
		return nil
	}

	resStr := string(content)
	resBytes := []byte(resStr)
	var userdata map[string]interface{}
	if err := json.Unmarshal(resBytes, &userdata); err != nil {
		fmt.Println("could not parse data")
		return nil
	}

	//fmt.Printf("response: %s", userdata)
	username := userdata["name"].(string)
	email := userdata["email"].(string)
	fmt.Println(username)
	fmt.Println(email)

	if count := db.DB.Where(&models.User{Username: username}).First(new(models.User)).RowsAffected; count > 0 {
		u := new(models.User)
		if res := db.DB.Where(
			&models.User{Username: username, Email: email}).First(&u); res.RowsAffected <= 0 {
			return c.JSON(fiber.Map{"error": true, "msg": "username already exists"})
		}
		if err := bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(googlepassword)); err != nil {
			return c.JSON(fiber.Map{
				"error": true,
				"msg":   "username already exists",
			})
		}

	} else {
		u := new(models.User)

		// Hashing the password with a random salt
		password := []byte(googlepassword)
		hashedPassword, err := bcrypt.GenerateFromPassword(
			password,
			8,
		)
		if err != nil {
			panic(err)
		}
		u.Password = string(hashedPassword)
		u.Username = username
		u.Email = email

		if err := db.DB.Create(&u).Error; err != nil {
			fmt.Println("insertion error")
			return c.JSON(fiber.Map{
				"error":   true,
				"general": "Something went wrong, please try again later. 😕",
			})
		}

	}

	//create accestoken and cookie
	accessToken := util.GenerateTokens(username)
	accessCookie := util.GetAuthCookies(accessToken)
	c.Cookie(accessCookie)
	c.Cookie(&fiber.Cookie{
		Name:     "username",
		Value:    username,
		HTTPOnly: true,
		Secure:   true,
	})

	//redirect to private route
	return c.Redirect("/api/user/private/", 301)
}
