package main

import (
	"io"
	"net/http"
	"strings"
	"testing"
)

// 测试对主页的 GET 请求是否会返回包含
// 未经身份验证的用户的 HTTP 代码 200
func TestShowIndexPageUnauthenticated(t *testing.T) {
	r := getRouter(true)
	r.GET("/", showIndexPage)

	// 创建一个发送到上面route的请求
	req, _ := http.NewRequest("GET", "/", nil)

	testHTTPResponse(t, r, req, func(w *http.ResponseWriter) {
		statusOK := w.Code == http.StatusOK

		// 测试页面标题是否为 “首页”

		p, err := io.ReadAll(w.Body)

		pageOK := err == nil && strings.Index(string(p), "<title>Home Page</title>") > 0

		return statusOK && pageOK
	})
}
