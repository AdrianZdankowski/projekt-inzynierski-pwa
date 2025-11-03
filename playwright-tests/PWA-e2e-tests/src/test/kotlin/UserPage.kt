import com.microsoft.playwright.*
import com.microsoft.playwright.options.LoadState
import com.microsoft.playwright.options.WaitForSelectorState
import io.qameta.allure.Allure
import io.qameta.allure.Step
import java.time.Duration

class UserPage(page: Page): BasePage(page)
{
    private val logoutButton = page.getByText("Wyloguj")
    private val myFilesButton = page.getByText("Moje pliki")
    private val appNameLabel = page.getByText("Aplikacja PWA")
    override fun isLoaded(): Boolean {
        return page.getByText("Aplikacja działa w przeglądarce.").isVisible
    }
    fun isMyFilesButtonVisible() = myFilesButton.isVisible
    fun isLogoutButtonVisible() = logoutButton.isVisible
    fun isMyFilesButtonEnabled() = myFilesButton.isEnabled
    fun isLogoutButtonEnabled() = logoutButton.isEnabled
    fun clickLogoutButton() = logoutButton.click()
    fun clickMyFilesButton() = myFilesButton.click()
    fun isAppNameVisible() = appNameLabel.isVisible

}