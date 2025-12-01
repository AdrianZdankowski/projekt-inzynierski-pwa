plugins {
    kotlin("jvm") version "2.0.20"
    id("io.qameta.allure") version "3.0.0"   // Allure Gradle plugin
}

repositories { mavenCentral() }

dependencies {
    testImplementation("com.microsoft.playwright:playwright:1.55.0")
    testImplementation(platform("org.junit:junit-bom:5.10.3"))
    testImplementation("org.junit.jupiter:junit-jupiter")
    // (Optional) If you prefer adding the adapter explicitly instead of plugin autoconfig:
    testImplementation("io.qameta.allure:allure-junit5:2.30.0")
}

tasks.test {
    useJUnitPlatform()
    systemProperty("playwright.headless", System.getProperty("playwright.headless", "true"))
    systemProperty("playwright.baseURL", System.getProperty("playwright.baseURL", "http://localhost:5173"))
}

kotlin { jvmToolchain(17) }

// Allure plugin configuration
allure {
    version = "2.34.1"              // report generator (CLI) version
    adapter {
        autoconfigure.set(true)        // add listeners automatically
        autoconfigureListeners.set(true)
        frameworks {
            junit5 { enabled.set(true) } // use JUnit 5 adapter
        }
        // Enable AspectJ only if you want @Step/@Attachment annotations (see §3)
        // aspectjWeaver.set(true)
    }
}
