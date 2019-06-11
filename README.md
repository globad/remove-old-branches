# remove-old-branches
### Briefly.
Removes old branches in Butbucket repository. Use it on your own risk!

### Description
 
Have you ever faced the situation when the number of branches in your working repository exceeds several hundreds?
In this case, it becomes very difficult to switch between them in some IDEs and create a Pull Request.
When I once again needed to remove unnecessary branches, I realized that the easiest way is to automate this process.
So this small script was started. All it does is it goes to the page with branches, scrolls it down to the very end
(by default the branches are sorted so that the oldest branches are found at the very bottom) and removes the branches from the bottom
up one by one until there are 100 branches left (this is customizable).
Exceptions are made for the master and develop branches and for the list of stop words. Be сareful! Use it at your own risk.
If something doesn't work, please add an Issue.

Made with __selenium-webdriver__,

browser used: Chrome.

repository: [some self-hosted Bitbucket](https://bitbucket.org/product/pricing?tab=self-hosted)

### System requirements:
- Node v. 8.9.1 (may be working with older versions, didn't check it)
- Chrome v. 72.0.3626 from [here](http://chromedriver.storage.googleapis.com/index.html?path=72.0.3626.7/) (put it in the project's parent directory).

All the switches in _config.js_.

For any reference go [here (selenium-webdriver docs)](https://seleniumhq.github.io/selenium/docs/api/javascript/index.html).
