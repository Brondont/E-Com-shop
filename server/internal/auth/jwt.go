package auth

import (
	"github.com/Brondont/E-Com-shop/config"
	"github.com/golang-jwt/jwt/v5"
)

// CreateJWT Creates user login token
func CreateJWT(userID uint) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"userID":    userID,
	})

	tokenString, err := token.SignedString([]byte(config.Envs.JWTSecret))
	if err != nil {
		return "", err
	}

	return tokenString, nil
}
