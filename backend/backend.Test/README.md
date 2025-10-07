# Backend Test Suite

This project contains unit and integration tests for the PWA backend application.

## Test Overview

The test suite includes **62 test methods** covering:

UNIT:
- **Authentication Tests** (6 tests) - User registration and login functionality
- **File Upload Tests** (5 tests) - File upload validation and error handling
- **File Download Tests** (11 tests) - File access, sharing, and download functionality
- **File Listing Tests** (12 tests) - File listing with pagination, sorting, and search
- **File Sharing Tests** (3 tests) - File sharing and access control
- **Upload Link Tests** (8 tests) - Upload link generation and validation
- **Commit Upload Tests** (6 tests) - File upload completion workflow
- **Video Streaming Tests** (2 tests) - Video file access validation

INTEGRATION:

- **Integration Tests** (9 tests) - End-to-end API workflow testing

## Test Framework

- **NUnit 3.14.0** - Primary testing framework
- **Microsoft.AspNetCore.Mvc.Testing** - Integration testing with ASP.NET Core
- **Moq 4.20.72** - Mocking framework for dependencies
- **In-Memory Database** - SQLite in-memory database for testing

## Running Tests

### Prerequisites
- .NET 8.0 SDK
- All dependencies restored (`dotnet restore`)

### Command Line
```bash
# Run all tests
dotnet test

# Run tests with detailed output
dotnet test --verbosity normal

# Run tests with coverage report
dotnet test --collect:"XPlat Code Coverage"

# Run specific test class
dotnet test --filter "ClassName=AuthTests"

# Run tests in watch mode (re-runs on file changes)
dotnet test --watch
```

## Test Structure

- **TestBase.cs** - Base class providing common test setup and teardown
- **IntegrationTests/** - End-to-end API testing with real HTTP requests
- **TestApiFactory.cs** - Factory for creating test web application instances
- **StubAzureBlobService.cs** - Mock implementation of Azure Blob Storage service

## Test Data

Tests use in-memory databases to ensure:
- Fast execution
- Isolation between tests
- No external dependencies
- Consistent test data setup

Each test is self-contained and cleans up after itself to prevent test interference.