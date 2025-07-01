package main

import (
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/gin-gonic/gin"
)

var tmpArticleList []article

// 该函数用于在执行测试函数之前进行设置
func TestMain(m *testing.M) {
	//将Gin设置为测试模式
	gin.SetMode(gin.TestMode)

	//运行其它测试
	os.Exit(m.Run())
}

// 在测试时创建一个新的路由实例
func getRouter(withTemplates bool) *gin.Engine {
	r := gin.Default()
	if withTemplates {
		r.LoadHTMLGlob("templates/*")
	}
	return r
}

// 用于处理请求并测试其响应
func testHTTPResponse(t *testing.T, r *gin.Engine, req *http.Request, f func(w *httptest.ResponseRecorder) bool) {

	//创建一个响应记录器
	w := httptest.NewRecorder()

	// 创建一个新的请求
	r.ServeHTTP(w, req)

	if !f(w) {
		t.Fail()
	}
}

// 保存当前的文章列表到临时变量中
func saveLists() {
	tmpArticleList = articleList
}

// 该函数用于从临时列表恢复主列表
func restoreLists() {
	articleList = tmpArticleList
}
