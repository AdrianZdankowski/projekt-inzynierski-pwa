import com.microsoft.playwright.*
import com.microsoft.playwright.options.LoadState
import com.microsoft.playwright.options.WaitForSelectorState
import io.qameta.allure.Allure
import io.qameta.allure.Step
import java.time.Duration

class HomePage(page: Page): BasePage(page)
{
    private val loginButton = page.getByText("Logowanie")
    private val appNameLabel = page.getByText("Aplikacja PWA")
    override fun isLoaded(): Boolean {
        return page.getByText("Aplikacja działa w przeglądarce.").isVisible
    }

    fun clickLoginButton() = loginButton.click()
    fun isAppNameVisible() = appNameLabel.isVisible
}