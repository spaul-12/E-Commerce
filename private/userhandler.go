package private

import (
	"fmt"

	"github.com/gofiber/fiber/v2"
	db "main.go/database"
	"main.go/models"
)

//fuction for deleting the user and its related data
func DeleteUser(c *fiber.Ctx) error {
	//delete userdatas
	i := new(models.Item)

	if res := db.DB.Where("User = ?", models.VerifiedUser).Delete(&i); res.RowsAffected < 0 {
		fmt.Println("no purchased item")
	}

	//delete user
	u := new(models.User)
	if res := db.DB.Where("Username = ?", models.VerifiedUser).Delete(&u); res.RowsAffected <= 0 {
		return c.JSON(fiber.Map{
			"msg": "unexpected error occured while deleting user",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status": "user deletion successful",
	})
}
