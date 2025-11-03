import com.microsoft.playwright.*
import com.microsoft.playwright.options.LoadState
import com.microsoft.playwright.options.WaitForSelectorState
import io.qameta.allure.Allure
import io.qameta.allure.Step
import java.time.Duration

abstract class BasePage(protected val page: Page) {
    @Step("Navigate to {url}")
    fun navigateTo(url: String) {
        page.navigate(url)
        waitForPageLoad()
    }

    @Step("Wait for page to load")
    protected fun waitForPageLoad() {
        page.waitForLoadState(LoadState.DOMCONTENTLOADED)
        page.waitForLoadState(LoadState.NETWORKIDLE)
    }

    @Step("Wait for element to be visible: {selector}")
    protected fun waitForElementVisible(selector: String, timeout: Duration = Duration.ofSeconds(10)) {
        page.waitForSelector(selector, Page.WaitForSelectorOptions()
            .setState(WaitForSelectorState.VISIBLE)
            .setTimeout(timeout.toMillis().toDouble())
        )
    }

    @Step("Wait for element to be hidden: {selector}")
    protected fun waitForElementHidden(selector: String, timeout: Duration = Duration.ofSeconds(10)) {
        page.waitForSelector(selector, Page.WaitForSelectorOptions()
            .setState(WaitForSelectorState.HIDDEN)
            .setTimeout(timeout.toMillis().toDouble())
        )
    }

    @Step("Check if element is visible: {selector}")
    protected fun isElementVisible(selector: String): Boolean {
        return try {
            page.locator(selector).isVisible()
        } catch (e: Exception) {
            false
        }
    }

    @Step("Check if element exists: {selector}")
    protected fun isElementPresent(selector: String): Boolean {
        return try {
            page.locator(selector).count() > 0
        } catch (e: Exception) {
            false
        }
    }

    abstract fun isLoaded(): Boolean
}
