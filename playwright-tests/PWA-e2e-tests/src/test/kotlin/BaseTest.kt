import com.microsoft.playwright.*
import io.qameta.allure.Allure
import org.junit.jupiter.api.*
import org.junit.jupiter.api.extension.ExtensionContext
import org.junit.jupiter.api.extension.TestWatcher
import java.io.ByteArrayInputStream
import java.nio.file.Paths
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
open class BaseTest {

    protected lateinit var playwright: Playwright
    protected lateinit var browser: Browser
    protected lateinit var context: BrowserContext
    protected lateinit var page: Page

    private val tracePath = Paths.get("build/reports/playwright/trace.zip")
    private val timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd_HH-mm-ss"))
    
    protected val baseUrl: String = System.getProperty("playwright.baseURL", "http://localhost:5173/")
    protected val headless: Boolean = System.getProperty("playwright.headless", "false").toBoolean()
    protected val slowMo: Int = System.getProperty("playwright.slowMo", "0").toInt()
    protected val viewportWidth: Int = System.getProperty("playwright.viewport.width", "1280").toInt()
    protected val viewportHeight: Int = System.getProperty("playwright.viewport.height", "800").toInt()
    protected val defaultTimeout: Int = System.getProperty("plwright.timeout", "30000").toInt()

    @BeforeAll
    fun setupPlaywright() {
        playwright = Playwright.create()

        val launchOptions = BrowserType.LaunchOptions()
            .setHeadless(headless)
            .setSlowMo(slowMo.toDouble())
            .setArgs(listOf("--no-sandbox", "--disable-dev-shm-usage"))

        browser = playwright.chromium().launch(launchOptions)
    }

    @BeforeEach
    fun createContextAndPage(testInfo: TestInfo) {
        val contextOptions = Browser.NewContextOptions()
            .setBaseURL(baseUrl)
            .setViewportSize(viewportWidth, viewportHeight)
            .setRecordVideoDir(Paths.get("build/reports/playwright/videos"))
            .setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")

        context = browser.newContext(contextOptions)
        page = context.newPage()

        page.setDefaultTimeout(defaultTimeout.toDouble())
        page.setDefaultNavigationTimeout(defaultTimeout.toDouble())

        context.tracing().start(
            Tracing.StartOptions()
                .setScreenshots(true)
                .setSnapshots(true)
                .setSources(true)
        )

        Allure.getLifecycle().updateTestCase { testResult ->
            testResult.name = testInfo.displayName
        }
    }

    @AfterEach
    fun closeContextAndAttach(testInfo: TestInfo) {
        val testName = testInfo.displayName.replace(" ", "_")

        val traceFile = Paths.get("build/reports/playwright/${testName}_trace.zip")
        context.tracing().stop(Tracing.StopOptions().setPath(traceFile))
        if (traceFile.toFile().exists()) {
            Allure.addAttachment(
                "Playwright trace",
                "application/zip",
                traceFile.toFile().inputStream(),
                "zip"
            )
        }

        val screenshot = page.screenshot(
            Page.ScreenshotOptions().setFullPage(true)
        )
        Allure.addAttachment("Final screenshot", "image/png", ByteArrayInputStream(screenshot), "png")

        context.close()
    }

    @AfterAll
    fun teardownPlaywright() {
        if (this::browser.isInitialized) browser.close()
        if (this::playwright.isInitialized) playwright.close()
    }

    protected inner class AllureFailureWatcher : TestWatcher {
        override fun testFailed(context: ExtensionContext, cause: Throwable) {
            if (this@BaseTest::page.isInitialized) {
                val screenshot = page.screenshot(
                    Page.ScreenshotOptions().setFullPage(true)
                )
                Allure.addAttachment(
                    "Failure screenshot",
                    "image/png",
                    ByteArrayInputStream(screenshot),
                    "png"
                )
            }
        }
    }
}
