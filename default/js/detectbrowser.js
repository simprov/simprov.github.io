$(window).on("load", function () {
    let reqChromeVersion = 57;
    let reqFirefoxVersion = 48;
    let parsedUserAgent = detect.parse(navigator.userAgent);
    // console.log(parsedUserAgent.browser.name);
    let splitArray = parsedUserAgent.browser.name.split(' ');
    // Use babel for IE
    // let [browserName, browserVersion] = splitArray;
    // OR
    let browserName = splitArray[0];
    let browserVersion = splitArray[1];
    if (browserName !== 'Chrome' && browserName !== 'Firefox') {
        alert('Please use Chrome >V56 or Firefox >V47');
    }
    if (browserName === 'Chrome') {
        if (parseInt(browserVersion, 10) < reqChromeVersion) {
            alert('Please use Chrome >V56');
        }
    }
    if (browserName === 'Firefox') {
        if (parseInt(browserVersion, 10) < reqFirefoxVersion) {
            alert('Please use Chrome >V47');
        }
    }
});