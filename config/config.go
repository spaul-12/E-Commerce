package config

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
)

func Config(key string) string {

	err := godotenv.Load("tsk.env")
	if err != nil {
		fmt.Print("error loading .env file")
	}

	return os.Getenv(key)
}
