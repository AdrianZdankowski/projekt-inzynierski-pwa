import com.microsoft.playwright.*
import com.microsoft.playwright.options.AriaRole
import com.microsoft.playwright.options.LoadState
import com.microsoft.playwright.options.WaitForSelectorState
import io.qameta.allure.Allure
import io.qameta.allure.Step
import java.time.Duration

class LoginPage(page: Page): BasePage(page)
{
    private val appNameLabel = page.getByText("Aplikacja PWA")
    val loginButton = page.getByRole(AriaRole.BUTTON, Page.GetByRoleOptions().setName("Zaloguj"))
    val usernameInput = page.getByLabel("Nazwa użytkownika")
    val passwordInput = page.getByLabel("Hasło")
    val loginFailedMessage = page.getByText("Użytkownik o podanej nazwie oraz wprowadzonym haśle nie istnieje. Spróbuj ponownie.")

    override fun isLoaded(): Boolean {
        return page.getByText("Zaloguj się").isVisible
    }

    fun clickLoginButton() = loginButton.click()
    fun isAppNameVisible() = appNameLabel.isVisible
    fun fillUsername(username: String) {
        usernameInput.fill(username)
    }

    fun fillPassword(password: String) {
        passwordInput.fill(password)
    }

    fun isLoginFailedMessageVisible() = loginFailedMessage.isVisible
}