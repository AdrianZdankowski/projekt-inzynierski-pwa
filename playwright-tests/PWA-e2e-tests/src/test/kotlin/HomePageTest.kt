import com.microsoft.playwright.*
import io.qameta.allure.Description
import io.qameta.allure.Feature
import io.qameta.allure.Story
import org.junit.jupiter.api.*
import org.junit.jupiter.api.Assertions.*

@Feature("Home Page")
@TestMethodOrder(MethodOrderer.OrderAnnotation::class)
class HomePageTest : BaseTest() {

    private lateinit var homePage: HomePage

    @BeforeEach
    fun setupHomePage() {
        homePage = HomePage(page)
        page.navigate("/")
    }

    @Test
    @Order(1)
    @Description("Verify home page loads correctly")
    @Story("Page Loading")
    fun `should load home page successfully`() {
        assertTrue(homePage.isLoaded(), "Home page should be loaded")
    }

    @Test
    @Order(2)
    @Description("Verify login button is clickable")
    @Story("Navigation")
    fun `should have clickable login button`() {
        homePage.clickLoginButton()
        val loginPage = LoginPage(page)
        page.waitForURL("/login")
        assertTrue(loginPage.isLoaded(), "Should navigate to login page after clicking login button")
    }

    @Test
    @Order(3)
    @Description("Verify page elements are present")
    @Story("UI Elements")
    fun `should have all required elements`() {
        assertTrue(homePage.isLoaded(), "Home page should be loaded")
        assertTrue(homePage.isAppNameVisible(), "App name should be visible")
        val loginButton = page.getByText("Logowanie")
        assertTrue(loginButton.isVisible, "Login button should be visible")
        assertTrue(loginButton.isEnabled, "Login button should be enabled")
    }

    @Test
    @Order(4)
    @Description("Verify page responsiveness")
    @Story("Responsive Design")
    fun `should be responsive on different viewport sizes`() {
        page.setViewportSize(375, 667)
        assertTrue(homePage.isLoaded(), "Home page should load on mobile viewport")
        assertTrue(homePage.isAppNameVisible(), "App name should be visible on mobile")

        page.setViewportSize(768, 1024)
        assertTrue(homePage.isLoaded(), "Home page should load on tablet viewport")
        assertTrue(homePage.isAppNameVisible(), "App name should be visible on tablet")

        page.setViewportSize(1280, 800)
        assertTrue(homePage.isLoaded(), "Home page should load on desktop viewport")
        assertTrue(homePage.isAppNameVisible(), "App name should be visible on desktop")
    }

    @Test
    @Order(5)
    @Description("Verify page performance")
    @Story("Performance")
    fun `should load within acceptable time`() {
        val startTime = System.currentTimeMillis()
        page.navigate("/")
        homePage.isLoaded()
        val loadTime = System.currentTimeMillis() - startTime
        assertTrue(loadTime < 5000, "Home page should load within 5 seconds, actual time: ${loadTime}ms")
        assertTrue(homePage.isLoaded(), "Home page should be loaded after performance test")
    }
}
