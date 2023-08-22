FROM golang:latest

RUN mkdir /app
WORKDIR /app/server

COPY go.mod .
COPY go.sum .
RUN go mod download
COPY . .