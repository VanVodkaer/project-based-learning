package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()
	router.LoadHTMLGlob("templates/*")

	// 调用Contex的HTML方法渲染模板
	router.GET("/", func(c *gin.Context) {
		c.HTML(
			// 状态码200
			http.StatusOK,
			//使用模板文件
			"index.html",
			gin.H{ // 绑定数据
				"title": "Home Pages",
			},
		)
	})

	// 启动应用
	router.Run()
}
