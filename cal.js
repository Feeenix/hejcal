// Author: Felix Pham
// finished at 3 am 28/07/2024 ;)
function TheMainFunction() {
    XMLHttpRequest.prototype.realSend = XMLHttpRequest.prototype.send;

    let ongoing_requests = 0

    XMLHttpRequest.prototype.send = function (value) {
        // console.log(this)
        if (this.__zone_symbol__xhrURL.includes("workschedule?")) {
            ongoing_requests++;
        }
        this.addEventListener("progress", function () {
            console.log(this);
            if (this.responseURL.includes("workschedule?")) {
                ongoing_requests--;
                // console.log(this.response); 
                let j = JSON.parse(this.response);
                console.log(j);
                j.forEach(obj => {
                    let k = obj["start"];

                    events[k] = obj;

                });
            }

            console.log("Loading. Here you can intercept...");
        }, false);
        this.realSend(value);
    };

    let events = {};

    const sleep = (ms) => {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    };
    if (!window.location.href.includes("/en/work/calendar/2")) {
        console.log(); ("The script could not finish because you are not on the calendar page")
        return
    }
    document.querySelectorAll("skapa-toggle:nth-child(2)>button:nth-child(3)")[0].click()
    // go through all calendar months


    async function waitForLastRequests() {
        await sleep(3000);
        document.querySelector("button#calendar-pager-previous").click()
        await sleep(1200);
        document.querySelector("button#calendar-pager-next").click()
        await sleep(1200);
        document.querySelector("button#calendar-pager-next").click()
        await sleep(1200);
        document.querySelector("button#calendar-pager-next").click()
        await sleep(1200);
        document.querySelector("button#calendar-pager-next").click()
        await sleep(1200);






        await sleep(3000);

        while (ongoing_requests > 0) {
            //do stuff;      
            await sleep(2000); //wait 1 sec then repeat the loop     
        }

        // generate ical file
        let ical_lines = [];


        function begin_ics() {
            ical_lines.push("BEGIN:VCALENDAR");
            ical_lines.push("VERSION:2.0");
            ical_lines.push("PRODID:-// TIME CREATED - {str(datetime.datetime.today())} //");
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

        begin_ics();
        for (const [key, event] of Object.entries(events)) {
            // console.log(`${key}: ${event}`);

            //{ title: "Kasse", start: "2024-08-24T10:00:00.000", end: "2024-08-24T13:30:00.000" }


            let title = event.title;
            let start = convert_time(event.start);
            let end = convert_time(event.end);
            add_to_ics(start + title, start, end, title, "", "", "");
        }
        end_ics();

        let ics_text = ical_lines.join("\n");

        function download(filename, text) {
            var element = document.createElement('a');
            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
            element.setAttribute('download', filename);

            element.style.display = 'none';
            document.body.appendChild(element);

            element.click();

            document.body.removeChild(element);
        }

        download("calendar.ics", ics_text)
    }
    waitForLastRequests();

}
TheMainFunction();