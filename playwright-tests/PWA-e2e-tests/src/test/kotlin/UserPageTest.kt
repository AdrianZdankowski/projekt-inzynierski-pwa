import com.microsoft.playwright.*
import io.qameta.allure.Description
import io.qameta.allure.Feature
import io.qameta.allure.Story
import org.junit.jupiter.api.*
import org.junit.jupiter.api.Assertions.*

@Feature("User Page")
@TestMethodOrder(MethodOrderer.OrderAnnotation::class)
class UserPageTest : BaseTest() {

    private lateinit var userPage: UserPage
    private lateinit var loginPage: LoginPage

    @BeforeEach
    fun setupUserPage() {
        loginPage = LoginPage(page)
        userPage = UserPage(page)
        loginPage.navigateTo("/login")
        loginTestUser()
        page.waitForTimeout(5000.0)
    }

    @Test
    @Order(1)
    @Description("Verify user page loads correctly")
    @Story("Page Loading")
    fun `should load user page successfully`() {
        assertTrue(userPage.isLoaded(), "User page should be loaded")
    }

    @Test
    @Order(2)
    @Description("Verify app name is visible on user page")
    @Story("UI Elements")
    fun `should display app name`() {
        assertTrue(userPage.isAppNameVisible(), "App name should be visible on user page")
    }

    @Test
    @Order(3)
    @Description("Verify navigation elements are present")
    @Story("UI Elements")
    fun `should have all required navigation elements`() {
        assertTrue(userPage.isLogoutButtonVisible(), "Logout button should be visible")
        assertTrue(userPage.isMyFilesButtonVisible(), "My files button should be visible")
        assertTrue(userPage.isLogoutButtonEnabled(), "Logout button should be enabled")
        assertTrue(userPage.isMyFilesButtonEnabled(), "My files button should be enabled")
    }

    @Test
    @Order(4)
    @Description("Verify logout button functionality")
    @Story("Navigation")
    fun `should have working logout button`() {
        userPage.clickLogoutButton()
        page.waitForTimeout(5000.0)
        assertTrue(loginPage.isLoaded(), "User should be logged out")
    }

    @Test
    @Order(5)
    @Description("Verify my files button functionality")
    @Story("Navigation")
    fun `should have working my files button`() {
        userPage.clickMyFilesButton()
        val userFilesPage = UserFilesPage(page)
        page.waitForTimeout(5000.0)
        assertTrue(userFilesPage.isLoaded(), "Should navigate to user files page after clicking my files button")
    }


    @Test
    @Order(6)
    @Description("Verify page responsiveness")
    @Story("Responsive Design")
    fun `should be responsive on different viewport sizes`() {
        
        page.setViewportSize(375, 667)
        assertTrue(userPage.isLoaded(), "User page should load on mobile viewport")
        assertTrue(userPage.isAppNameVisible(), "App name should be visible on mobile")
        
        page.setViewportSize(768, 1024)
        assertTrue(userPage.isLoaded(), "User page should load on tablet viewport")
        assertTrue(userPage.isAppNameVisible(), "App name should be visible on tablet")
        
        page.setViewportSize(1280, 800)
        assertTrue(userPage.isLoaded(), "User page should load on desktop viewport")
        assertTrue(userPage.isAppNameVisible(), "App name should be visible on desktop")
    }

    @Test
    @Order(7)
    @Description("Verify page state persistence")
    @Story("State Management")
    fun `should maintain state during navigation`() {
        
        userPage.clickMyFilesButton()
        val userFilesPage = UserFilesPage(page)
        page.waitForTimeout(3000.0)
        assertTrue(userFilesPage.isLoaded(), "Should navigate to files page")
        
        page.goBack()
        page.waitForTimeout(3000.0)
        assertTrue(userPage.isLoaded(), "Should return to user page")
        assertTrue(userPage.isAppNameVisible(), "App name should still be visible")
    }

    private fun loginTestUser() {
        loginPage.fillUsername("superadmin")
        loginPage.fillPassword("Password123!")
        loginPage.clickLoginButton()
    }
}
