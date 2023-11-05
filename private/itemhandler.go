package private

import (
	//"math/rand"

	"fmt"
	"strconv"

	db "main.go/database"
	"main.go/models"

	//"main.go/util"

	//"golang.org/x/crypto/bcrypt"

	//"github.com/dgrijalva/jwt-go"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/lib/pq"
)

// function for entering purchased item details in DB
func CreateEntry(c *fiber.Ctx) error {

	type iteminput struct {
		Bookid          uint32 `json:"bookid"`
		Quantity        uint32 `json:"quantity"`
		ShippingAddress string `json:"shippingaddress"`
		PaymentMethod   string `json:"paymentmethod"`
	}

	input := new(iteminput)
	if err := c.BodyParser(input); err != nil {
		return c.JSON(fiber.Map{
			"error": true,
			"msg":   "incorrect input",
		})
	}
	VerifiedUser := c.Cookies("username")
	var book models.BookStock
	res := db.DB.Where("bookid = ?", input.Bookid).Find(&book)
	res.Scan(&book)

	t := models.GetTimeNow()
	fmt.Println(t)
	item := models.Item{
		User:            VerifiedUser,
		OrderID:         uuid.New(),
		Bookid:          book.Bookid,
		Bookname:        book.Bookname,
		Time:            t,
		Quantity:        input.Quantity,
		Totalprice:      (uint64(input.Quantity) * (book.Price)),
		ShippingAddress: input.ShippingAddress,
		PaymentMethod:   input.PaymentMethod,
	}

	fmt.Println(book)
	fmt.Println(item)

	if book.Quantity < input.Quantity {
		return c.JSON(fiber.Map{
			"error": true,
			"msg":   "out of stock",
		})
	} else {
		book.Quantity = book.Quantity - input.Quantity
		err := db.DB.Model(&models.BookStock{}).Where("bookid = ?", book.Bookid).Update("quantity", book.Quantity).Error
		if err != nil {
			return c.JSON(fiber.Map{
				"error": true,
				"msg":   "update error",
			})
		}
	}

	if err := db.DB.Create(&item).Error; err != nil {
		return c.JSON(fiber.Map{
			"error": true,
			"msg":   "insertion error",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"error":  false,
		"status": "order successfull",
	})
}

// function for removing purchased item data
func DeleteEntry(c *fiber.Ctx) error {

	type iteminput struct {
		Bookid uint32 `json:"bookid"`
		Time   string `json:"time"`
	}

	input := new(iteminput)
	if err := c.BodyParser(input); err != nil {
		return c.JSON(fiber.Map{
			"error":  true,
			"status": "incorrect input",
		})
	}

	VerifiedUser := c.Cookies("username")
	var book models.BookStock
	resbook := db.DB.Where("bookid = ?", input.Bookid).Find(&models.BookStock{})
	resbook.Scan(&book)
	fmt.Println(book)

	var item models.Item
	resitem := db.DB.Where("\"user\" = ? AND bookid = ? AND \"time\" = ?", VerifiedUser, book.Bookid, input.Time).Find(&item)
	resitem.Scan(&item)
	fmt.Println(item)

	book.Quantity = book.Quantity + item.Quantity
	err := db.DB.Model(&models.BookStock{}).Where("bookid = ?", input.Bookid).Update("quantity", book.Quantity).Error
	if err != nil {
		return c.JSON(fiber.Map{
			"error":  true,
			"status": "update error",
		})
	}

	if err := db.DB.Where("\"user\" = ? AND bookid = ? AND \"time\" = ?", VerifiedUser, book.Bookid, input.Time).Delete(&models.Item{}).Error; err != nil {
		return c.JSON(fiber.Map{
			"error":  true,
			"status": "Deletion error",
		})
	}

	//test time
	/*then, _ := time.Parse("2022-08-14 14:25", input.Time)
	fmt.Println(then)
	now, _ := time.Parse("2022-8-14 14:25", time.Now().Format("2022-8-14 14:25"))
	fmt.Println(now)
	delta := now.Sub(then)
	fmt.Println(delta.Hours())*/

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"error":  false,
		"status": "cancellation successfull",
	})
}

// function for adding items to the cart
func AddtoCart(c *fiber.Ctx) error {

	type iteminput struct {
		Bookid   uint32 `json:"bookid"`
		Quantity uint32 `json:"quantity"`
	}

	input := new(iteminput)
	if err := c.BodyParser(input); err != nil {
		return c.JSON(fiber.Map{
			"error": true,
			"msg":   "incorrect input",
		})
	}

	VerifiedUser := c.Cookies("username")
	var book models.BookStock
	var cart models.Cart
	res := db.DB.Where("bookid = ?", input.Bookid).Find(&models.BookStock{})
	res.Scan(&book)

	t := models.GetTimeNow()
	fmt.Println(t)
	if r := db.DB.Where("\"user\" = ? AND bookid = ?", VerifiedUser, book.Bookid).Find(&models.Cart{}); r.RowsAffected <= 0 {
		cartitem := models.Cart{
			User:       VerifiedUser,
			Bookid:     input.Bookid,
			Bookname:   book.Bookname,
			Time:       t,
			Quantity:   input.Quantity,
			Totalprice: (uint64(input.Quantity * uint32(book.Price))),
		}

		if book.Quantity < input.Quantity {
			return c.JSON(fiber.Map{
				"error": true,
				"msg":   "not having enough stock",
			})
		}

		if err := db.DB.Create(&cartitem).Error; err != nil {
			return c.JSON(fiber.Map{
				"error": true,
				"msg":   "insertion error",
			})
		}

	} else {
		r.Scan(&cart)
		cart.Quantity = cart.Quantity + input.Quantity
		if book.Quantity < cart.Quantity {
			return c.JSON(fiber.Map{
				"error": true,
				"msg":   "not having enough stock",
			})
		}
		cart.Totalprice = uint64(cart.Quantity) * book.Price
		if err := db.DB.Model(&models.Cart{}).Where("\"user\" = ? AND bookid = ?", VerifiedUser, book.Bookid).Updates(models.Cart{Time: t, Quantity: cart.Quantity, Totalprice: cart.Totalprice}).Error; err != nil {
			return c.JSON(fiber.Map{
				"error": true,
				"msg":   "insertion error",
			})
		}
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"error": false,
		"msg":   "adding to cart successfull",
	})

}

// function for removing items from cart
func DeletefromCart(c *fiber.Ctx) error {

	type iteminput struct {
		Bookid uint32 `json:"bookid"`
		Time   string `json:"time"`
	}

	input := new(iteminput)
	if err := c.BodyParser(input); err != nil {
		return c.JSON(fiber.Map{
			"error":  true,
			"status": "incorrect input",
		})
	}
	VerifiedUser := c.Cookies("username")

	err := db.DB.Where("\"user\" = ? AND bookid = ? AND \"time\" = ?", VerifiedUser, input.Bookid, input.Time).Delete(&models.Cart{}).Error
	if err != nil {
		fmt.Println("error occured while deleting cart")
		return c.JSON(fiber.Map{
			"error": true,
			"msg":   "deletion error",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"error":  false,
		"status": "cart deletion successfull",
	})
}

// function to place cart orders
func PlaceCartOrders(c *fiber.Ctx) error {
	type checkout struct {
		ShippingAddress string `json:"shippingaddress"`
		PaymentMethod   string `json:"paymentmethod"`
	}
	input := new(checkout)
	if err := c.BodyParser(input); err != nil {
		fmt.Println("parsing error")
		return nil
	}
	var book models.BookStock
	var cart models.Cart
	var qnt uint32
	var st = true
	VerifiedUser := c.Cookies("username")

	rows, _ := db.DB.Model(&models.Cart{}).Where("\"user\" = ?", VerifiedUser).Rows()
	defer rows.Close()

	for rows.Next() {

		db.DB.ScanRows(rows, &cart)
		res := db.DB.Select("quantity").Where("bookid = ?", cart.Bookid).Find(&book)
		res.Scan(&qnt)

		if qnt < cart.Quantity {
			st = false
			continue
		}

		qnt = qnt - cart.Quantity

		item := models.Item{
			User:            cart.User,
			OrderID:         uuid.New(),
			Bookid:          cart.Bookid,
			Bookname:        cart.Bookname,
			Time:            models.GetTimeNow(),
			Quantity:        cart.Quantity,
			Totalprice:      cart.Totalprice,
			ShippingAddress: input.ShippingAddress,
			PaymentMethod:   input.PaymentMethod,
		}

		if err := db.DB.Model(&book).Where("bookid = ?", cart.Bookid).Update("quantity", qnt).Error; err != nil {
			fmt.Println("update error")
		}

		if err := db.DB.Create(&item).Error; err != nil {
			fmt.Println("insert error")
		}

		if err := db.DB.Where("\"user\" = ? AND bookid = ? AND \"time\" = ?", VerifiedUser, cart.Bookid, cart.Time).Delete(&models.Cart{}).Error; err != nil {
			fmt.Println("deletion error")
		}

	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status": st,
	})
}

// function for getting cart data
func GetCartData(c *fiber.Ctx) error {
	type cartdata struct {
		Bookid     uint32
		Bookname   string
		Time       string
		Quantity   uint32
		St         bool
		Totalprice uint64
	}

	var cartitems []cartdata
	var cartitem cartdata
	var cart models.Cart
	var qnt uint32
	VerifiedUser := c.Cookies("username")

	rows, _ := db.DB.Model(&models.Cart{}).Where("\"user\" = ?", VerifiedUser).Rows()
	defer rows.Close()
	for rows.Next() {
		db.DB.ScanRows(rows, &cart)
		qntres := db.DB.Model(&models.BookStock{}).Select("quantity").Where("bookid = ?", cart.Bookid)
		qntres.Scan(&qnt)
		cartitem.Bookid = cart.Bookid
		cartitem.Bookname = cart.Bookname
		cartitem.Time = cart.Time
		cartitem.Quantity = cart.Quantity
		if qnt < cart.Quantity {
			cartitem.St = false
		} else {
			cartitem.St = true
		}
		cartitem.Totalprice = cart.Totalprice
		cartitems = append(cartitems, cartitem)
	}
	fmt.Println(cartitems)

	return c.JSON(cartitems)
}

// function for getting purchased items data
func GetPurchaseData(c *fiber.Ctx) error {
	type purchasedata struct {
		Bookid     uint32
		Bookname   string
		Time       string
		Quantity   uint32
		Totalprice uint64
	}

	var purchaseditems []purchasedata
	var purchaseditem purchasedata
	var item models.Item
	VerifiedUser := c.Cookies("username")

	rows, _ := db.DB.Model(&models.Item{}).Where("\"user\" = ?", VerifiedUser).Rows()
	defer rows.Close()
	for rows.Next() {
		db.DB.ScanRows(rows, &item)
		purchaseditem.Bookid = item.Bookid
		purchaseditem.Bookname = item.Bookname
		purchaseditem.Time = item.Time
		purchaseditem.Quantity = item.Quantity
		purchaseditem.Totalprice = item.Totalprice
		purchaseditems = append(purchaseditems, purchaseditem)
	}
	fmt.Println(purchaseditems)

	//this is for testing purpose

	return c.JSON(purchaseditems)
}

/*
   these functions are required to show the details of a selected book
*/
//create a cookie for bookid
func CreateBookCookie(c *fiber.Ctx) error {
	type iteminput struct {
		Bookid string `json:"bookid"`
	}
	input := new(iteminput)
	if err := c.BodyParser(input); err != nil {
		return c.JSON(fiber.Map{
			"error": true,
			"msg":   "cannot parse data",
		})
	}
	c.Cookie(&fiber.Cookie{
		Name:     "id_of_book_to_be_shown",
		Value:    fmt.Sprint(input.Bookid),
		HTTPOnly: true,
		Secure:   true,
	})

	return c.JSON(fiber.Map{
		"error": false,
		"msg":   "cookiecreation successfull",
	})
}

// use cookie value to identify the book
func ShowBook(c *fiber.Ctx) error {
	idstr := c.Cookies("id_of_book_to_be_shown")
	id, _ := strconv.Atoi(idstr)
	type Relatedbook struct {
		Bookid   uint32
		Bookname string
		Price    uint64
	}

	var selectedbook models.BookStock
	var relatedbook Relatedbook
	var relatedbooks []Relatedbook
	if res := db.DB.Model(&selectedbook).Where("bookid = ?", id).Find(&selectedbook); res.RowsAffected <= 0 {
		fmt.Println("book not found")
		return nil
	}

	rows, err := db.DB.Model(&models.BookStock{}).Select("bookid", "bookname", "price").Where("category && ?", pq.StringArray(selectedbook.Category)).Rows()
	if err != nil {
		fmt.Println(err)
		return nil
	}
	defer rows.Close()
	for rows.Next() {
		db.DB.ScanRows(rows, &relatedbook)
		if relatedbook.Bookid != uint32(id) {
			relatedbooks = append(relatedbooks, relatedbook)
		}
	}
	fmt.Println(relatedbooks)
	return c.JSON(fiber.Map{
		"selectedbook": selectedbook,
		"relatedbooks": relatedbooks,
	})

}

// Track Package
func TrackPackage(c *fiber.Ctx) error {
	type iteminput struct {
		Bookid uint32 `json:"bookid"`
		Time   string `json:"time"`
	}

	input := new(iteminput)
	if err := c.BodyParser(input); err != nil {
		return c.JSON(fiber.Map{
			"error":  true,
			"status": "incorrect input",
		})
	}

	VerifiedUser := c.Cookies("username")
	var item models.Item
	resitem := db.DB.Where("\"user\" = ? AND bookid = ? AND \"time\" = ?", VerifiedUser, input.Bookid, input.Time).Find(&item)
	resitem.Scan(&item)
	fmt.Println(item)

	return c.JSON(item)
}
