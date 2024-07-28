// ==UserScript==
// @name         Kronos ICS Calendar
// @namespace    http://tampermonkey.net/
// @version      2024-07-29
// @description  try to take over the world!
// @author       Felix
// @include      *wfcstatic/applications/navigator/html5/dist/container/index.html*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=ikea.com
// @grant        none
// ==/UserScript==

const sleep = (ms) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
};
async function create_and_download_calendar() {
    var iframedoc;
    if (document.querySelector("#widgetFrame1666")) {
        iframedoc = document.querySelector("#widgetFrame1666").contentDocument;
    } else {
        iframedoc = document;
    }
    // document = iframedoc;
    // generate ical file
    let ical_lines = [];
    function begin_ics() {
        ical_lines.push("BEGIN:VCALENDAR");
        ical_lines.push("VERSION:2.0");
        ical_lines.push("PRODID:-// TIME CREATED - "+new Date()+" //");
    }
    function end_ics() {
        ical_lines.push("END:VCALENDAR");
    }
    function add_to_ics(uid, start, end, summary, comment, description, url) {
        ical_lines.push("BEGIN:VEVENT");
        ical_lines.push("UID:" + uid);
        ical_lines.push("DTSTART:" + start);
        ical_lines.push("DTEND:" + end);
        ical_lines.push("SUMMARY:" + summary);
        if (comment) {
            ical_lines.push("LOCATION:" + comment);
        }
        if (description) {
            ical_lines.push("DESCRIPTION:" + description);
        }
        if (url) {
            ical_lines.push("URL:" + url);
        }
        ical_lines.push("END:VEVENT");
    }
    function convert_time(time) {
        "2024-07-30T17:00:00.000"
        "20240312T143000"
        let year = time.slice(0, 4);
        let month = time.slice(5, 7);
        let day = time.slice(8, 10);
        let hour = time.slice(11, 13);
        let minute = time.slice(14, 16);
        let second = time.slice(17, 19);

        return year + month + day + "T" + hour + minute + second;
    }



    begin_ics()
    console.log("creating calendar")

    iframedoc.getElementById("employeecalendar.actions.switchViewToWeekly").click()
    while (true) {
        let previous_button = iframedoc.querySelectorAll("button.icon-btn")[0];
        if (previous_button.getAttribute("disabled")) {
            break;
        }
        previous_button.click()
    }
    console.log("back all the way")
    await sleep(500);
    while (true) {
        console.log("new week")
        let tableHeads = iframedoc.querySelectorAll("th.fc-day-header.fc-widget-header")
        let datess = []
        tableHeads.forEach(thEl => {
            datess.push(thEl.getAttribute("data-date"))
        });
        let days = iframedoc.querySelectorAll(".fc-time-grid>.fc-content-skeleton tr>td:not(:nth-child(1))")
        for (let i = 0; i < 7; i++) { //[0,1,2,3 ... 6]
            console.log("new day")
            let date = datess[i];

            // multipart shifts
            let segments = days[i].querySelectorAll(".fc-event-container>a .transfer-segment");
            segments.forEach(async (segment) => {
                await sleep(100);
                let startEnd;
                if (segment.querySelector(".event-start-end")) {// segmented
                     startEnd = segment.querySelector(".event-start-end").innerText; // 13:30-17:00
                } else { // monolithic
                     startEnd = segment.querySelector(".event-title").innerText; // 13:30-17:00
                }
                let start = convert_time(date + "T" + startEnd.slice(0, 5) + ":00.000");
                let end = convert_time(date + "T" + startEnd.slice(6, 11) + ":00.000");
                let title = segment.querySelector(".event-org-node__content");
                title = ("" + title.innerText).split("/");
                title = title[title.length - 1]
                add_to_ics(start, start, end, title);
            });


        }


        await sleep(100);
        let next_button = iframedoc.querySelectorAll("button.icon-btn")[1];
        if (next_button.getAttribute("disabled")) {
            break;
        }
        next_button.click()
        await sleep(500);

    }
    console.log("forward all the way")
    end_ics();

    let ics_text = ical_lines.join("\n");

    function download(filename, text) {
        var element = iframedoc.createElement('a');
        element.setAttribute('href', 'data:text/calendar;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);

        element.style.display = 'none';
        iframedoc.body.appendChild(element);

        element.click();

        iframedoc.body.removeChild(element);
    }
    console.log("downloading")
    download("calendar.ics", ics_text)



}

(async () => {
    console.log("LOADED script")
    await sleep(5000);
    var iframedoc;
    if (document.querySelector("#widgetFrame1666")) {
        iframedoc = document.querySelector("#widgetFrame1666").contentDocument;
    } else {
        iframedoc = document;
    }

    let buttonContainer = iframedoc.getElementById("html.employeecalendar.toolbar.requests")
    let buttonEl = iframedoc.createElement("button");
    buttonEl.innerHTML = "Download Calendar";
    buttonEl.className = "btn i btn-rounded non-compressible widget-button-icon"
    buttonEl.style.padding = "10px"
    buttonEl.style.height = "100%"
    buttonEl.addEventListener("click", create_and_download_calendar);
    buttonContainer.appendChild(buttonEl);
})();