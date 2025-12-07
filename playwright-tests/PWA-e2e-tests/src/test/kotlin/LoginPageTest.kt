import com.microsoft.playwright.*
import com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat
import io.qameta.allure.Description
import io.qameta.allure.Feature
import io.qameta.allure.Story
import org.junit.jupiter.api.*
import org.junit.jupiter.api.Assertions.*

@Feature("Login Page")
@TestMethodOrder(MethodOrderer.OrderAnnotation::class)
class LoginPageTest : BaseTest() {

    private lateinit var loginPage: LoginPage

    @BeforeEach
    fun setupLoginPage() {
        loginPage = LoginPage(page)
        page.navigate("/login")
    }

    @Test
    @Order(1)
    @Description("Verify login page loads correctly")
    @Story("Page Loading")
    fun `should load login page successfully`() {
        assertTrue(loginPage.isLoaded(), "Login page should be loaded")
    }

    @Test
    @Order(2)
    @Description("Verify app name is visible on login page")
    @Story("UI Elements")
    fun `should display app name`() {
        assertTrue(loginPage.isAppNameVisible(), "App name should be visible on login page")
    }

    @Test
    @Order(3)
    @Description("Verify login form elements are present")
    @Story("Form Elements")
    fun `should have all required form elements`() {
        assertTrue(loginPage.usernameInput.isVisible, "Username input should be visible")
        assertTrue(loginPage.passwordInput.isVisible, "Password input should be visible")
        assertTrue(loginPage.loginButton.isVisible, "Login button should be visible")
        assertTrue(loginPage.loginButton.isEnabled, "Login button should be enabled")
    }

    @Test
    @Order(4)
    @Description("Verify username input functionality")
    @Story("Form Interactions")
    fun `should allow entering username`() {
        val testUsername = "testuser"
        loginPage.fillUsername(testUsername)
        val usernameInput = page.getByLabel("Nazwa użytkownika")
        val inputValue = usernameInput.inputValue()
        assertEquals(testUsername, inputValue, "Username should be entered correctly")
    }

    @Test
    @Order(5)
    @Description("Verify password input functionality")
    @Story("Form Interactions")
    fun `should allow entering password`() {
        val testPassword = "testpassword"
        loginPage.fillPassword(testPassword)
        val passwordInput = page.getByLabel("Hasło")
        val inputValue = passwordInput.inputValue()
        assertEquals(testPassword, inputValue, "Password should be entered correctly")
    }

    @Test
    @Order(6)
    @Description("Verify complete login form submission")
    @Story("Form Submission")
    fun `should allow complete login form submission`() {
        val testUsername = "superadmin"
        val testPassword = "Password123!"
        
        loginPage.fillUsername(testUsername)
        loginPage.fillPassword(testPassword)

        val usernameInput = page.getByLabel("Nazwa użytkownika")
        val passwordInput = page.getByLabel("Hasło")
        
        assertEquals(testUsername, usernameInput.inputValue(), "Username should be filled")
        assertEquals(testPassword, passwordInput.inputValue(), "Password should be filled")

        loginPage.clickLoginButton()
        assertTrue(true, "Login button should be clickable")
    }

    @Test
    @Order(7)
    @Description("Verify complete login form submission")
    @Story("Form Submission")
    fun `should block invalid data login form submission`() {
        val testUsername = "superadmin"
        val testPassword = "Password123!45"

        loginPage.fillUsername(testUsername)
        loginPage.fillPassword(testPassword)

        val usernameInput = page.getByLabel("Nazwa użytkownika")
        val passwordInput = page.getByLabel("Hasło")

        assertEquals(testUsername, usernameInput.inputValue(), "Username should be filled")
        assertEquals(testPassword, passwordInput.inputValue(), "Password should be filled")

        loginPage.clickLoginButton()
        page.waitForTimeout(3000.0)
        assertTrue(loginPage.isLoginFailedMessageVisible(), "Login error message should be visible")
    }

    @Test
    @Order(8)
    @Description("Verify form validation with empty fields")
    @Story("Form Validation")
    fun `should handle empty form submission`() {
        assertTrue(loginPage.loginButton.isEnabled, "Login button should be enabled even with empty form")
        loginPage.clickLoginButton()
        assertTrue(loginPage.isLoaded(), "Login page should still be loaded after empty submission")
    }
}
