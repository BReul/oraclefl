# features/postTo.feature
Feature: Http Post Feature
  As a user of postTo
  I want to be able to post data to a URL
  So that I can get a response from the web server

  @webServer
  Scenario: Posting to a local web server
    Given I have required the postTo function
      And a webServer that supports POST path resource when posted "success" it returns that string
     When I execute the function
     Then I should see it resolve to "success"