package router

import (
	"github.com/gofiber/fiber/v2"
)

// USER handles all the user routes
var USER fiber.Router

/*func hello(c *fiber.Ctx) error {
	return c.SendString("Hello World!")
}*/

// SetupRoutes setups all the Routes
func SetupRoutes(app *fiber.App) {

	api := app.Group("/api")
	//auth := app.Group("/authenticated")
	//api.Get("/", hello)
	//auth.Get("/", hello)

	USER = api.Group("/user")
	SetupUserRoutes()

}
