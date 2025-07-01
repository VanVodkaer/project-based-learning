package main

import "github.com/gin-gonic/gin"

var router *gin.Engine

func main() {
	router = gin.Default()

	// 在启动时处理模板这样就不用再从磁盘中加载一次
	// 可以提高性能
	router.LoadHTMLGlob("templates/*")

	// 处理 主页
	router.GET("/", showIndexPage)

	// 启动服务器
	router.Run()
}
