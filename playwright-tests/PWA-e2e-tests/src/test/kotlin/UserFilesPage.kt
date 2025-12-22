import com.microsoft.playwright.*
import com.microsoft.playwright.options.LoadState
import com.microsoft.playwright.options.WaitForSelectorState
import io.qameta.allure.Allure
import io.qameta.allure.Step
import java.time.Duration

class UserFilesPage(page: Page): BasePage(page)
{
    private val logoutButton = page.getByText("Wyloguj")
    private val myFilesButton = page.getByText("Moje pliki")
    private val addFileButton = page.getByText("+")
    private val appNameLabel = page.getByText("Aplikacja PWA")
    override fun isLoaded(): Boolean {
        return page.getByText("Nie masz żadnych plików obecnie").isVisible
    }

    fun clickLogoutButton() = logoutButton.click()
    fun clickMyFilesButton() = myFilesButton.click()
    fun clickAddFileButton(): SendFilePopup {
        addFileButton.click()
        return SendFilePopup(page)
    }
    fun isAppNameVisible() = appNameLabel.isVisible

}