# Contributing to OpenRCA UI

:+1::tada: First off, thanks for taking the time to contribute! :tada::+1:

The following is a set of guidelines for contributing to OpenRCA UI project. These are mostly
guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in
a pull request.

#### Table Of Contents

[Development environment](#development-environment)

[Workflow](#workflow)
  * [Pull requests](#pull-requests)
  * [Issues](#pull-requests)

[Styleguides](#styleguides)
  * [Git commit messages](#git-commit-messages)

## Development environment

**TODO:** Add instructions for setting up development environment

## Workflow

### Pull requests

If you're working on an existing issue, respond to the issue and express interest in working on it.
This helps other people know that the issue is active, and hopefully prevents duplicated efforts.

To submit a proposed change:

- [Fork](https://help.github.com/en/github/getting-started-with-github/fork-a-repo) the affected
  repository.
- Create a new branch for your changes.
- Develop the code/fix.
- Add new test scenarios. In the case of a bug fix, the tests should fail without your code changes.
  For new features try to cover as many variants as reasonably possible.
- Modify the documentation as necessary.
- Verify the entire CI process (building and testing) works.

While there may be exceptions, the general rule is that all PRs should be 100% complete - meaning
they should include all test cases and documentation changes related to the change.

### Issues

[GitHub issues](https://github.com/openrca/orca-ui/issues/new) can be used to report bugs or
submit feature requests.

When reporting a bug please include the following key pieces of information:

- The version of the project you were using (e.g. version number, or git commit).
- The exact, minimal, steps needed to reproduce the issue. Submitting a 5 line script will get
  a much faster response from the team than one that's hundreds of lines long.

## Styleguides

### Git commit messages

* Use the present tense ("Add probe for..." not "Added probe for...").
* Use the imperative mood ("Add probe for..." not "Adds probe for...").
* Limit the first line to 72 characters or less.
* Reference issues and pull requests liberally after the first line.
