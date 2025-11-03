import com.microsoft.playwright.*
import com.microsoft.playwright.options.LoadState
import com.microsoft.playwright.options.WaitForSelectorState
import io.qameta.allure.Allure
import io.qameta.allure.Step
import java.io.File
import java.time.Duration
import java.nio.file.Paths

class SendFilePopup(page: Page) {
    val chooseFileButton = page.getByLabel("Wybierz plik")
    val sendFileButton = page.getByLabel("Wyślij plik")
    val fileInput = page.locator("input[type='file']")

    fun clickChooseFileButton() = chooseFileButton.click()
    fun clickSendFileButton() = sendFileButton.click()

    fun isSendFileButtonEnabled() = sendFileButton.isEnabled
    fun chooseFile(path: String) {
        fileInput.setInputFiles(Paths.get(path))
    }
}