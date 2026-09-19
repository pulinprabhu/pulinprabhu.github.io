// window.location.reload("www.tedxbitshyderabad.com");

//  LANDING PART STARTS
var factor = 0;

/* Landing -> archive handover.
   One class toggle drives the whole sequence; the CSS owns the timing so a
   reduced-motion viewer gets the same handover with none of the movement. */
(function () {
    var landing = document.getElementById("landing");
    var btn = document.getElementById("enter-btn");
    var container = document.querySelector(".container");
    if (!landing || !btn) return;

    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var left = false;

    function enterArchive() {
        if (left) return;
        left = true;

        landing.classList.add("is-leaving");
        document.body.style.overflowY = "scroll";

        if (container) {
            container.classList.add("is-arriving");

            // The class carries a transform, which makes .container the
            // containing block for every position:fixed descendant -- the
            // navbar and all the video modals. If it ever stuck, those would
            // silently break, so drop it on a timer as well as on animationend.
            var settle = function () { container.classList.remove("is-arriving"); };
            container.addEventListener("animationend", settle, { once: true });
            window.setTimeout(settle, 1000);
        }

        window.setTimeout(function () {
            landing.classList.add("is-gone");
        }, reduced ? 20 : 1120);
    }

    btn.addEventListener("click", enterArchive);

    window.addEventListener("keydown", function (e) {
        if (left) return;
        if (e.key === "ArrowDown" || e.key === "PageDown") enterArchive();
    });

    window.addEventListener("wheel", function (e) {
        if (!left && e.deltaY > 12) enterArchive();
    }, { passive: true });

    var touchY = null;
    window.addEventListener("touchstart", function (e) {
        touchY = e.touches[0].clientY;
    }, { passive: true });
    window.addEventListener("touchmove", function (e) {
        if (left || touchY === null) return;
        if (touchY - e.touches[0].clientY > 40) enterArchive();
    }, { passive: true });
})();

// LANDING PART ENDS


/* Card lists stack into a long column on narrow screens, so each one shows
   three and keeps the rest behind a button. Desktop ignores this entirely --
   the CSS only reveals the control below 1024px. */
(function () {
    document.querySelectorAll(".view-more").forEach(function (btn) {
        var cards = document.getElementById(btn.dataset.cards);
        if (!cards) return;

        if (cards.childElementCount <= 3) {
            btn.style.display = "none";
            return;
        }

        var label = btn.querySelector(".view-more-label");
        var collapsed = btn.dataset.label;

        btn.addEventListener("click", function () {
            var open = cards.classList.toggle("cards-expanded");
            btn.classList.toggle("is-open", open);
            btn.setAttribute("aria-expanded", String(open));
            label.textContent = open ? "Show fewer" : collapsed;

            if (!open) {
                var top = cards.getBoundingClientRect().top + window.scrollY - 80;
                window.scrollTo({ top: top, behavior: "smooth" });
            }
        });
    });
})();

/* Every talk archive: play the video, show the speaker's bio, close again.
   One handler for all four sections. Each card carries its own data-video, so
   this does not depend on the global generate(), whose active copy has the
   "show the modal" line commented out -- which is why the 2019 and 2018
   videos never opened. Bios come from the TEDx event manager export. */
(function () {
    var BIOS = {
        "Vikas Gupta": "Vikas Gupta, the second runner-up for Bigboss season 11, has gained quite the status as a T.V personality being a producer and creator. This reputation complemented by his past roles as Creative head for Ekta Kapoor's Balaji Television comprising of several top-grossing shows like Kyuki Saas Bhi Kabhi Bahu Thi. He is the pioneer of “The Lost Boy Productions” which is involved in the creation of famous shows like Kiasi Yeh Yaariya, Gumah, Yeh Hai Aashiqui and a lot more. He later headed the TV channel &TV. In addition to this, he went on to become the youngest person to head MTV in the world along with winning the “TV Personality of the year” at the Lions Gold Awards.",
        "Manish Advani": "A story teller, a song writer, recognised for positioning brands in the industry through CSR and Green initiatives. Heads Marketing and Public Relations for MSSG. Bears a work experience of over 2 decades on client engagements from organizations like Microsoft, Hindustan Unilever, Jaguar and Land Rover, etc. in various roles. An honourable recipient of Microsoft President Award and various others. A gold medalist from New Jersey Institute of Technology with Summa Cum Laude. Manish has completed brand building program from Stanford and One year program from Harvard.",
        "Nidhika Bahl": "Nidhika holds the distinction of being the ALL Ladies League Maharashtra Chairperson for Coaching and of being the official Life Coach of Miss Diva Universe 2017 finalists, coaching the likes of Miss World 2017 Manushri Chillar. Considered to be one of the most inspiring entrepreneurs of our time, having features in newspapers such as The Economic Times and Mumbai Mirror.",
        "Rashi Mal": "Rashi is a professionally trained actress, dancer and singer/songwriter. She started her acting career on stage and has studied method acting at the Jeff Goldberg Studio. She is currently shooting her first Hindi feature film and has also worked on an Indo French film which will release shortly. She has starred in several popular web series including 'Boygiri', 'A.I.S.H.A My Virtual Girlfriend', 'Time Out' and the mini-series 'Paanch' on Channel V. She's also making a name for herself in the music industry. She sang the song 'Buri Buri' for the film Dear Maya starring Manisha Koirala and also wrote the rap for it. She's a professionally trained dancer too and was a company member of choreographer Ashley Lobo's dance company, The Danceworx. All in all she is the textbook definition of a true artist.",
        "Swapan Rajdev": "Swapan Rajdev is the Chief Technology Officer & Co-founder at Haptik, one of the world's largest chatbot platforms. He oversees the entire engineering function at Haptik which includes product development, scalability, and future vision from a technology and product perspective. Apart from this, Swapan's focus is on the culture at Haptik. He is consistently working on new and innovative ways to make it one of the best places to work at.",
        "Mohsin Memon": "Mohsin Memon is the founder and CEO of MEM corp immersive learning. Mohsin is a gamer and a game designer who has been playing and designing games all his life. He believes games have the ability to do more for humanity than we can imagine. He has worked closely with leaders of companies like Motorola, Wal-Mart, Delta Airlines, GroupM and many others to embed learning as a part of the organization's culture.",
        "Max Fernandes": "Max Fernandes possess a knack for adapting to any role humanly possible which is highlighted by his past where he has played over 15 roles in eight organizations after which he finally found his adobe in theatre. One of his recent plays is “Ruby Moon” by The Peas and Carrots Theatre Company. He has also been a crucial TV actor for Sony, OML, Star and so on. With an objective of promotion of Theatre arts, he conducts theatre workshops at St. Xavier's Institute of Communication and St Paul's Institute as well. He's been an essential part of several schools for the same. Despite the enormous amount of praise, he has the definition of “Humble” engraved in his soul.",
        "Robin Chaurasia": "Robin helped organize a successful campaign to change US armed forces policy after being forced to leave her position as an Air Force officer because of her sexuality. The experience inspired her to go into teaching and to found an NGO in India called Kranti. Robin has formalized a social justice curriculum at Kranti covering key issues that affect the girls' lives which they use to design and implement projects. In 2013, they convinced an MP to help them register sex workers to vote. They have led workshops for more than 100,000 people and delivered 11 TEDx talks around the world. They toured a play they wrote about the experiences across the USA, performing at the headquarters of Facebook and Google.",
        "Ayush Mehra": "Ayush Mehra is nothing short of a superhero! He's a strong believer of the fact that hard work and perseverance yields the best and the most powerful fruits. Speaking of food, Ayush can eat 2 pizzas at one stretch (another superhero power) and he loves to watch football. He's very diligently worked hard as an assistant director for 4 movies, the recent one being URI: The Surgical Strike. Alongside all this, he's acted in several commercials and sketches of channels like Filter Copy, Arré and more. Not to forget his contributions as the lead role in the recent, Times web series MomCo and his new web show, Minus One, which is soon to release! He is known for possessing a jovial personality and a friendly nature. There's a lot more to him and it's equally exciting!",
        "Kaam Bhari": "Kaam Bhaari, a young emcee with a knack for taking people's breath away with his rap, has translated his success with a lot of hard work. He was intrigued by hip hop at a very young age and was discovered by Superstars like Ranveer Singh. Kaam Bhaari was also one of the final four rappers to perform with Ranveer Singh as part of the famous brand Jack & Jones' competition. Having overcome all his childhood hardships, he managed to grab the limelight by making several T.V commercial jingles and get featured in the super hit movie, Gully Boy in which he also wrote and co-composed two amazing songs, “Kaam Bhaari” and “Kab Se Kab Tak”. He's a young Lyricist with infinite potential.",
        "Sumeet Vyas": "Sumeet Vyas is a critically acclaimed Indian actor and writer of films, web series and theatre. His breakthrough role was Mikesh Chaudhary in TVF's 2014 web series Permanent Roommates. He has since been a part of various Bollywood films including the 2015 productions Parched and 2018's Veere Di Wedding. He has his first starring role in 2016 drama film Ribbon, his performance was well received by critics. His subsequent roles in Tripling and various plays proved him to be a versatile actor who isn't afraid to break the mould.",
        "Eisha Chopra": "Eisha Chopra is a prominent film, web actor and screenwriter. The inception of her acting career was first marked with the blockbuster hit Neerja, and the critically acclaimed TV show Prisoners of War. Since then she has been the female lead for several web shows such as What The Folks, The Great Indian Dysfunctional Family and Official CEOgiri, opposite actors like Sumeet Vyas & Barun Sobti. She has also been the face of major advertising campaigns such as the recent Forever Mark Diamonds for DeBeers. She is also a popular Internet personality, and a role model for the independent Indian woman.",
        "Kavish Sinha": "Kavish Sinha is a man that has seen it all. From working as a brand strategist for the best of today's ad agencies like Ogilvy, JWT and Grey Worldwide, to his foray into his present domain as a Casting Director in Bollywood. Just 3 years into the industry, he's now running his own successful Casting Company “On-My-Kayroll”. His litany of clients will make your head spin. He's successfully served the likes of Mani Ratnam, Sunny Deol, Nikhil Advani, Rohan Sippy and many other illustrious names. He loves his job and believes it's extremely important to put the right faces to the writer's words and director's vision.",
        "Ameya Kanawade": "Ameya is at the rear end of the commonly despised GEM category but has a height taller than your sense of humour. He is usually found dodging train handles when he isn't fumbling with words. Poor man's 'Aditya Roy Kapoor' as he is known by the local guys, he is fond of maths and is currently into teaching. He will quickly calculate your share of the bill and will then run faster than a leggy lass in sneakers giving anyone a run for his money.",
        "Aakshaye Rathi": "Mr. Akshaye Rathi is a man with diverse interests. He is a film exhibitor, distributor, columnist, teacher and start up incubator. Armed with an MBA from the S.P Jain Institute of Management & Research, he has always made the utmost efforts to achieve the greatest of goals. He's the trailblazer of consolidating the unorganised film exhibition sector in tier 2 & 3 towns of central India by orchestrating a strategic association for his cinemas with the Mexican chain Cinepolis.",
        "Ali Mustafa Shaikh": "Mustafa Ali Shaikh is a 20 year old Artificial Intelligence expert who happens to be the point of contact for Google Crowdsource alongside being the president of Infikey.org. Mustafa is the proud holder of Google Crowdsource Community leader Award of 2018 and has been the co-organizer of Google Cloud Developers Community. Apart from being a professional with over 20 certifications from Google, he has been awarded 3 Digital badges from IBM for his excellence in several domains circling around A.I, Chatbots, Blockchain and more. His achievements and brilliance are massive and cannot be defined within the confines of mere words.",
        "Angry Prash": "Angry Prash — the man, the myth, the legend. Angry Prash is popular for his iconic long white nose and circular bald head (we mean the helmet) and expresses himself through illustrations, skits, and music. With only MS Paint to his rescue, Angry Prash animated his ideas on the white page with a pen tool. Angry Prash is one of India's celebrated animation YouTube channels, with 6.3M subscribers and 1M followers on Instagram. He shares a zeal for comedy sketches and music, and his army is waiting for him to reveal his face — till then we binge on his content!",
        "Sushant Pujari": "Sushant Pujari has been actively involved in Bollywood for 15 years. He worked with Remo D'Souza and has assisted him for over 10 years. He is an avid biker, loves dancing, a disciplined fitness freak, has a keen interest in gardening and is a Traveller by heart. He has worked as an actor in movies, his debut being ABCD directed by Remo D'Souza. He has also starred in music videos. He is the main lead of the musical 'Merchants of Bollywood' which showcases the history and richness of Bollywood culture all around the world. He is a loving family man and is happily married. He is also a kind and loving father to his daughter, Laasya.",
        "Jhanvi Bhatia": "Jhanvi Bhatia is a fashion & beauty creator who's making personal styling a process to embrace our own body. She's spreading smiles & pushing insecurities away with one outfit a day through her videos!",
        "Sai Godbole": "Sai took the TEDxSPIT stage to share her journey in the acting industry — an inspiring and uplifting talk that left the audience spellbound. She also offered valuable insights and practical advice on how to embark on a career path as an actor.",
        "Tushar Mahajan": "Although being a photographer was never his plan, Tushar Mahajan has succeeded in making a name for himself through his work in this industry over the past five years. At present, he makes music videos for Euphoria and manages social media content and behind the scenes for one of the biggest YouTube channels in India - BB Ki Vines. When he is not working, he likes playing cricket and listening to music, ranging from rock and roll to Indian classical music.",
        "Rudraksh Jaiswal": "Rudhraksh Jaiswal kickstarted his career in 2013 when he bagged the role of Sahadev in Mahabharata. Despite being a child actor, he has maintained a clean balance between his studies and his acting commitments. Widening his multi-faceted journey, Rudhraksh stepped into the world of films with Noor (2017). The latest addition to his long list of achievements is Extraction, where he had the chance of working alongside Chris Hemsworth and David Harbour. He is a jovial person, who's always ready to persevere and learn in order to shape ideas into reality.",
        "Shams Alam": "Shams Alam is an Indian Para Swimmer, who holds the world record for the Longest Open Sea Swimming by paraplegic person. An engineer and an MBA by profession, he overcame all odds to be an international gold medalist para swimmer and was awarded the best emerging leader in disability sports & sports diplomacy by the U.S. Department of State Global Sports Mentoring Program in 2018. He has continued to inspire the youth by delivering multiple TEDx talks & motivational speeches over the years.",
        "Anjali Barot": "An actor and social media sensation, Anjali Barot has made her presence felt across digital, print, television and OTT platforms. She wowed audiences with her work in Sony LIV's Scam 1992, directed by Hansal Mehta, and rose to prominence with her quirky and relatable roles in digital sketches across ScoopWhoop, FilterCopy and BuzzFeed. When she is not facing the camera, Anjali enjoys a kadak cup of chai and holidaying in the hills."
    };

    document.querySelectorAll(".section").forEach(function (section) {
        var modal = section.querySelector(".archive-info");
        var panel = modal && modal.querySelector(".archive-bio");
        if (!panel) return;

        var nameEl = panel.querySelector(".archive-bio-name");
        var talkEl = panel.querySelector(".archive-bio-talk");
        var textEl = panel.querySelector(".archive-bio-text");

        var isSpeakers = section.id === "speakers";
        var frame = modal.querySelector("iframe");
        var videoBox = modal.querySelector(".archive-video");
        var portrait = modal.querySelector(".archive-portrait");
        var socialList = panel.querySelector(".archive-bio-social");
        var cards = Array.prototype.slice.call(section.querySelectorAll(".cards > *"));
        var last = cards.length - 1;

        var ICONS = { lin: "fa-linkedin-in", insta: "fa-instagram", fb: "fa-facebook-f", tw: "fa-twitter" };

        function socials(person) {
            if (!socialList) return;
            socialList.textContent = "";
            Object.keys(ICONS).forEach(function (key) {
                var href = person[key];
                if (!href || href === "#") return;
                var li = document.createElement("li");
                var a = document.createElement("a");
                a.href = href;
                a.target = "_blank";
                a.rel = "noopener";
                a.innerHTML = '<i class="fab ' + ICONS[key] + '"></i>';
                li.appendChild(a);
                socialList.appendChild(li);
            });
        }

        cards.forEach(function (card, i) {
            var trigger = card.querySelector(".card-details");
            var title = card.querySelector(".card-title");
            if (!trigger || !title) return;

            trigger.addEventListener("click", function () {
                var name = ((title.querySelector("h2") || {}).textContent || "").trim();
                var sub = ((title.querySelector("h4") || {}).textContent || "").trim();
                var bio = BIOS[name];
                var photo = "";

                // the 2020 speakers carry richer data than the card shows
                var person = isSpeakers && window.speakers_data ? window.speakers_data[i] : null;
                if (person) {
                    name = person.name || name;
                    sub = [person.occupation, person.talk].filter(Boolean).join(" \u00b7 ");
                    bio = person.write_up || bio;
                    photo = person.picture || "";
                    socials(person);
                } else if (socialList) {
                    socialList.textContent = "";
                }

                nameEl.textContent = name;
                talkEl.textContent = sub;
                textEl.textContent = bio || "";
                panel.hidden = !(bio || name);

                var video = card.dataset.video;
                if (video) {
                    frame.src = "https://www.youtube.com/embed/" + video + "?autoplay=1";
                    if (videoBox) videoBox.hidden = false;
                    if (portrait) portrait.hidden = true;
                } else {
                    // no talk recording -- fall back to the speaker's portrait
                    frame.src = "about:blank";
                    if (videoBox) videoBox.hidden = true;
                    if (portrait) {
                        portrait.src = photo;
                        portrait.alt = name;
                        portrait.hidden = !photo;
                    }
                }

                modal.style.display = "block";
                modal.scrollTop = 0;
            });

            // the older sections drive this from inline onmouseover; the two
            // new ones need it wired up here
            if (!card.getAttribute("onmouseover")) {
                card.addEventListener("mouseover", function () { shift(i, true); });
                card.addEventListener("mouseout", function () { shift(i, false); });
            }
        });

        function shift(j, on) {
            cards.forEach(function (card, i) {
                var cls = null;
                if (j === 0 && i > 0) cls = "shiftCardRight90";
                else if (j === last && i < last) cls = "shiftCardLeft90";
                else if (i < j) cls = "shiftCardLeft50";
                else if (i > j) cls = "shiftCardRight50";
                if (cls) card.classList[on ? "add" : "remove"](cls);
            });
        }

        modal.addEventListener("click", function () {
            modal.style.display = "none";
            // the older sections still have a jQuery close handler that sets
            // src = "", which resolves against the page and reloads the whole
            // site into the hidden iframe; clear it after those have run
            setTimeout(function () { frame.src = "about:blank"; }, 0);
        });
    });
})();

var speaker_info = document.getElementById("speakers-info");
var executive_info = document.getElementById("executives-info");
var archive_info = document.getElementById("archives-info");
var archive_info_2018 = document.getElementById("archives-info-2018");

// SPEAKER VARIABLES
var speaker_cards = document.getElementById("speakers");
speaker_cards = speaker_cards.children[1].children[1];
var speaker_cards_len = speaker_cards.childElementCount;
var speakers = [];
for (var i = 0; i < speaker_cards.childElementCount; i++) {
    var card = speaker_cards.children[i];
    speakers.push(card.id);
}

function Speaker(name, occupation, talk, write_up, fb, insta, lin, tw, picture) {
    this.name = name
    this.occupation = occupation
    this.talk = talk
    this.write_up = write_up
    this.fb = fb
    this.insta = insta
    this.lin = lin
    this.tw = tw
    this.picture = picture
}

var speakers_data = [];


// EXECUTIVE VARIABLES
var exec_cards = document.getElementById("executives");
exec_cards = exec_cards.children[1].children[1];
var exec_cards_len = exec_cards.childElementCount;
var executives = [];
for (var i = 0; i < exec_cards.childElementCount; i++) {
    var card = exec_cards.children[i];

    // console.log(card.id);
    executives.push(card.id);
}

function Executive(name, post, write_up, fb, insta, lin, picture) {
    this.name = name
    this.post = post
    this.write_up = write_up
    this.fb = fb
    this.insta = insta
    this.lin = lin
    this.picture = picture
}

var executives_data = [];

// SPONSORS VARIABLES
// var spons_cards = document.getElementById("sponsors");
// spons_cards = spons_cards.children[1].children[1];
// var spons_cards_len = spons_cards.childElementCount;
// var sponsors = [];
// for (var i = 0; i < spons_cards.childElementCount; i++) {
//     var card = spons_cards.children[i];

//     // console.log(card.id);
//     sponsors.push(card.id);
// }

// ARCHIVESS VARIABLES
var archive_cards = document.getElementById("archives");
archive_cards = archive_cards.children[1].children[1];
var archive_cards_len = archive_cards.childElementCount;
var archives = [];
for (var i = 0; i < archive_cards.childElementCount; i++) {
    var card = archive_cards.children[i];
    // console.log(card.id);
    archives.push(card.id);
}
function Archive(name, talk, link) {
    this.name = name
    this.talk = talk
    this.link = link
}
var archives_data = [];

// 2018 ARCHIVESS VARIABLES
var archive_cards_2018 = document.getElementById("archives_2018");
archive_cards_2018 = archive_cards_2018.children[1].children[1];
var archive_cards_2018_len = archive_cards_2018.childElementCount;
var archives_2018 = [];
for (var i = 0; i < archive_cards_2018.childElementCount; i++) {
    var card = archive_cards_2018.children[i];
    // console.log(card.id);
    archives_2018.push(card.id);
}
function Archive_2018(name, talk, link) {
    this.name = name
    this.talk = talk
    this.link = link
}
var archives_2018_data = [];

// Loading all the data from the JSON file
function loadJSON(filename, callback) {
    var speakers_file = new XMLHttpRequest();
    speakers_file.overrideMimeType("application/json");
    speakers_file.open("GET", filename, true);
    // console.log("Opening File");
    speakers_file.onreadystatechange = function() {
        // console.log("File is ready");
        if (speakers_file.readyState == 4 && (speakers_file.status == 200 || speakers_file.status == 0)) {
            // console.log("Sending Callback");
            callback(speakers_file.responseText);
        }
    }
    speakers_file.send(null);
    // console.log("Done");
}

window.onload = function() {
    // loadJSON("./json/speakers_data.json", function(response) {
        var data = {
            "speaker": [{
                    "name": "Anjali Barot",
                    "occupation": "Actor",
                    "talk_name": "Chhoti Aakhein, Bade Sapne",
                    "write_up": "An actor and social media sensation, Anjali Barot has made her presence felt across digital, print, television and OTT platforms. When she is not facing the camera, Anjali enjoys a kadak cup of chai and holidaying in the hills. A foodie by birth and someone with an infectious energy, Anjali always has a story or two to tell.",
                    "facebook": "",
                    "insta": "https://www.instagram.com/anjalibarotofficial/",
                    "linkedin": "",
                    "twitter": "",
                    "picture_loc": "./media/speakers/Anjali_Barot.png"
                },
                {
                    "name": "Tushar Mahajan",
                    "occupation": "Photographer & DOP",
                    "talk_name": "One Frame at a Time",
                    "write_up": "Although being a photographer was never his plan, Tushar Mahajan has succeeded in making a name for himself through his work in this industry over the past five years. At present, he makes music videos for Euphoria and manages social media content and behind the scenes for one of the biggest YouTube channels in India - BB Ki Vines. When he is not working, he likes playing cricket and listening to music, ranging from rock and roll to Indian classical music.",
                    "facebook": "",
                    "insta": "https://www.instagram.com/tusharmahajanofficial/",
                    "linkedin": "",
                    "twitter": "",
                    "picture_loc": "./media/speakers/Tushar_Mahajan.png"
                },
                {
                    "name": "Pratik Gandhi",
                    "occupation": "Actor",
                    "talk_name": "",
                    "write_up": "After the apt portrayal of Harshad Mehta in Sony Liv's Scam 1992, Pratik Gandhi has become a household name. His role has the entire country singing his praises. However, this shot to fame didn't happen overnight. After years of working as a mechanical engineer and taking up acting gigs on the side, Pratik eventually quit his job to pursue acting full time. How he went from a mechanical engineer to the man of the hour, is a journey you don't want to miss.",
                    "facebook": "",
                    "insta": "https://www.instagram.com/pratikgandhiofficial/",
                    "linkedin": "",
                    "twitter": "",
                    "picture_loc": "./media/speakers/Pratik_Gandhi.png"
                },
                {
                    "name": "Rudhraksh Jaiswal",
                    "occupation": "Actor",
                    "talk_name": "Climbing up the Success Ladder",
                    "write_up": "Rudhraksh Jaiswal kickstarted his career in 2013 when he bagged the role of Sahadev in Mahabharata. Despite being a child actor, he has maintained a clean balance between his studies and his acting commitments. Widening his multi-faceted journey, Rudhraksh stepped into the world of films with Noor (2017). The latest addition to his long list of achievements is Extraction, where he had the chance of working alongside Chris Hemsworth and David Harbour. He is a jovial person, who's always ready to persevere and learn in order to shape ideas into reality.",
                    "facebook": "",
                    "insta": "https://www.instagram.com/rudhrakshjaiswal1/",
                    "linkedin": "",
                    "twitter": "",
                    "picture_loc": "./media/speakers/Rudraksh_Jaiswal.png"
                },
                {
                    "name": "Shams Alam",
                    "occupation": "Indian Para Swimmer",
                    "talk_name": "In Search of a Comprehensive Society",
                    "write_up": "Shams Alam is an Indian Para Swimmer, who holds the world record for the Longest Open Sea Swimming by paraplegic person. An engineer and an MBA by profession, he overcame all odds to be an international gold medalist para swimmer and was awarded the best emerging leader in disability sports & sports diplomacy by the U.S. Department of State Global Sports Mentoring Program in 2018. He has continued to inspire the youth by delivering multiple TEDx talks & motivational speeches over the years.",
                    "facebook": "",
                    "insta": "https://www.instagram.com/iamshamsaalam/",
                    "linkedin": "",
                    "twitter": "",
                    "picture_loc": "./media/speakers/Shams_Alam.png"
                },
                {
                    "name": "Dr. Dilip Pawar",
                    "occupation": "Covid-19 Task Force Doctor",
                    "talk_name": "",
                    "write_up": "Dr. Dilip Pawar is a Physician, International Cancer Research Specialist, and a COVID-19 expert. He holds the Guinness World Record for screening the largest number of cases of Breast Cancer by self-examination. Apart from having more than 175 Scientific Publications to his name, Dr. Pawar is a recipient of several awards for COVID-19 related research and a pioneer in the Steam Inhalation Therapy for COVID-19. He has also been selected as an Indian Army Doctor for COVID-19.",
                    "facebook": "",
                    "insta": "",
                    "linkedin": "",
                    "twitter": "",
                    "picture_loc": "./media/speakers/Dilip_Pawar.png"
                }
                // {
                //     "name": "Imtiaz Qureshi",
                //     "occupation": "Padma Shri, Master Chef at ITC.",
                //     "talk_name": "Talk Name Eight",
                //     "write_up": "A Padma Shree winning culinary wizard, Imtiaz Qureshi has been a paragon of Indian cuisine in the country, becoming a widely adored figure in the culinary scene across the country. The master chef at the ITC Hotel franchise, Imtiaz has been at the face of the brand and has constantly played a great role in developing and nurturing the future of India's cuisine..",
                //     "facebook": "https://www.facebook.com/legendofimtiazqureshi/",
                //     "insta": "https://www.instagram.com/legendofimtiaz/?hl=en",
                //     "linkedin": "https://in.linkedin.com/in/imtiaz-qureshi-269b1830",
                //     "twitter": "#",
                //     "picture_loc": "./media/speakers/imtiaz.png"
                // },
                // {
                //     "name": "Piyush Bhisekar",
                //     "occupation": "Poet, Singer-Songwriter",
                //     "talk_name": "Talk Name Eight",
                //     "write_up": "Piyush Bhisekar is a poet and an award winning singer-songwriter who released his debut EP in 2018 with six melodic, soulful and cathartic musical pieces.",
                //     "facebook": "https://www.facebook.com/PiyushBhisekar/",
                //     "insta": "https://www.instagram.com/piyush_bhisekar/?hl=en",
                //     "linkedin": "#",
                //     "twitter": "#",
                //     "picture_loc": "./media/speakers/piyush.png"
                // },
                // {
                //     "name": "Major Mohammad Ali Shah",
                //     "occupation": "Indian Theater Personality, Actor and Former Soldier",
                //     "talk_name": "Talk Name Eight",
                //     "write_up": "An award winning theatre actor, a nationally celebrated film actor, a IPL match coordinator, a respected public speaker, an IIM graduate, a brave army veteran and an international TEDx speaker, Major Mohammad Ali Shah - the master of many trades is a true Indian icon, traversing and conquering his many field.",
                //     "facebook": "#",
                //     "insta": "#",
                //     "linkedin": "#",
                //     "twitter": "#",
                //     "picture_loc": "./media/speakers/major_shah.png"
                // },
                // {
                //     "name": "Ramesh Kumar Soni",
                //     "occupation": "Co-Founder and Director at VayuJal Technologies Private Limited",
                //     "talk_name": "Talk Name Eight",
                //     "write_up": "Ramesh Kumar Soni's creation, a machine that can generate water from thin air, has the power to revolutionize the world. This could very well be the solution to all of our water woes..",
                //     "facebook": "https://www.facebook.com/rameshsoni2010",
                //     "insta": "#",
                //     "linkedin": "https://in.linkedin.com/in/ddkvrs",
                //     "twitter": "#",
                //     "picture_loc": "./media/speakers/ramesh.png"
                // }
            ]
        }
        data = data["speaker"];
        // speakers_data = JSON.parse(response);
        // console.log(data);
        for (var i in data) {
            // console.log(data[1]);
            // console.log(data[i].name);
            speakers_data.push(new Speaker(data[i].name, data[i].occupation, data[i].talk_name, data[i].write_up, data[i].facebook, data[i].insta, data[i].linkedin, data[i].twitter, data[i].picture_loc));
        }
    // });
    // loadJSON("./json/executives_data.json", function(response) {
        var data = {
            "executive" : [
                {
                    "name" : "Pulin Prabhu", 
                    "lead" : "Licensee and Curator", 
                    "write_up" : "Can tell the difference between Space Grey and Silver. Catch me behind the lens or staring at the screen trying to work new ways of entwining Technology, Managment and Finance.", 
                    "facebook" : "https://www.facebook.com/pulinprabhu02/", 
                    "insta" : "https://www.instagram.com/pulinprabhu/", 
                    "linkedin" : "https://www.linkedin.com/in/pulinprabhu", 
                    "picture_loc" : "./media/team/Pulin_Prabhu.jpg"
                },
                {
                    "name" : "Sahil Sheth", 
                    "lead" : "Curator", 
                    "write_up" : "Believes smart work is more effective than hard work.", 
                    "facebook" : "https://www.facebook.com/sahil.sheth.353", 
                    "insta" : "https://www.instagram.com/sahil_sheth5", 
                    "linkedin" : "https://www.linkedin.com/in/sahilsheth263", 
                    "picture_loc" : "./media/team/Sahil_Sheth.jpg"
                },
                {
                    "name" : "Romit Kankaria", 
                    "lead" : "Curator", 
                    "write_up" : "Fascinated by reel stuff, trying to achieve something real and make things happen. Movie buff. Cricket Geek.", 
                    "facebook" : "#", 
                    "insta" : "https://www.instagram.com/romitv7/", 
                    "linkedin" : "https://www.linkedin.com/in/romit-vinod-kankaria-b50408177/", 
                    "picture_loc" : "./media/team/Romit_Kankaria.jpg"
                },
                {
                    "name" : "Himanshu Joshi", 
                    "lead" : "Curator", 
                    "write_up" : "", 
                    "facebook" : "https://www.facebook.com/himanshu.joshi.129794", 
                    "insta" : "https://www.instagram.com/thehimanshuj/", 
                    "linkedin" : "https://www.linkedin.com/in/himanshu-joshi-512a1a184", 
                    "picture_loc" : "./media/team/Himanshu_Joshi.jpg"
                },
                {
                    "name" : "Harsh Agarwal", 
                    "lead" : "Exective Producer", 
                    "write_up" : "Have a passion for playing with numbers, be it the binaries of code or the intricacies of the stock market. Give me a situation, and I'm ready to grow from it, and given a chance, make more from it.", 
                    "facebook" : "#", 
                    "insta" : "https://www.instagram.com/harsh_2703/", 
                    "linkedin" : "https://www.linkedin.com/in/harshagarwal2703/", 
                    "picture_loc" : "./media/team/Harsh_Agarwal.jpg"
                },
                {
                    "name" : "Jimil Shah", 
                    "lead" : "Technical Director", 
                    "write_up" : "An ordinary metalhead wanting to write code like Zuckerberg, poetry like Bukowski, growl like Mikael Akerfeldt and play drums like Gavin Harrison.", 
                    "facebook" : "#", 
                    "insta" : "https://www.instagram.com/postrockfanboy", 
                    "linkedin" : "https://www.linkedin.com/in/jimilproggrammer/", 
                    "picture_loc" : "./media/team/Jimil_Shah.jpg"
                },
                {
                    "name" : "Saurabh Rane", 
                    "lead" : "Creative Director", 
                    "write_up" : "Manifesting the vision of TEDxSPIT though digital prints, liberal yet detail-oriented work that makes you go wow!", 
                    "facebook" : "#", 
                    "insta" : "https://www.instagram.com/saurabhrane11", 
                    "linkedin" : "https://in.linkedin.com/in/saurabhrane1199", 
                    "picture_loc" : "./media/team/Saurabh_Rane.jpg"
                },
                {
                    "name" : "Vinayak Iyer", 
                    "lead" : "Content Strategist", 
                    "write_up" : "Adventurous. Gregarious. Persistent. ", 
                    "facebook" : "#", 
                    "insta" : "https://www.instagram.com/vinayak_iyer_/", 
                    "linkedin" : "https://www.linkedin.com/in/vinayak-iyer-/", 
                    "picture_loc" : "./media/team/Vinayak_Iyer.jpg"
                },
                {
                    "name" : "Urja Kulkarni", 
                    "lead" : "Content Strategist", 
                    "write_up" : "She’s a foodie who is always up for new adventures.", 
                    "facebook" : "#", 
                    "insta" : "https://www.instagram.com/urjax/", 
                    "linkedin" : "https://www.linkedin.com/in/urja-kulkarni/", 
                    "picture_loc" : "./media/team/Urja_Kulkarni.jpg"
                },
                {
                    "name" : "Raksha Jain", 
                    "lead" : "Finance Head", 
                    "write_up" : "A knack for creativity, combing that with the principles of design thinking she strives to come up with solutions to complex problems. New found interest in finance just makes the entire process more wholesome.", 
                    "facebook" : "https://www.facebook.com/raksha.jain.167", 
                    "insta" : "https://www.instagram.com/rakshaajain/?hl=en", 
                    "linkedin" : "https://www.linkedin.com/in/raksha-jain13/", 
                    "picture_loc" : "./media/team/Raksha_Jain.jpg"
                },
                {
                    "name" : "Parth Kitawat", 
                    "lead" : "Finance Head", 
                    "write_up" : "He’s passionate about everything related to finance and startups. He believes that the biggest risk is in not taking any risk.", 
                    "facebook" : "#", 
                    "insta" : "https://www.instagram.com/parthkitawat/", 
                    "linkedin" : "https://www.linkedin.com/in/parth-kitawat-4a8b62146/", 
                    "picture_loc" : "./media/team/Parth_Kitawat.jpg"
                },
                {
                    "name" : "Kareena Redij", 
                    "lead" : "PR Head", 
                    "write_up" : "She’s audacious, bright and a silly intellect. Being quick-witted is her superpower. She’s here to pitch in new ideas and add a hint of fun in all that she does.", 
                    "facebook" : "#", 
                    "insta" : "https://instagram.com/kareenaredij?igshid=u32x5l8zfhev", 
                    "linkedin" : "www.linkedin.com/in/kareena-redij", 
                    "picture_loc" : "./media/team/Kareena_Redij.jpg"
                },
                {
                    "name" : "Taksh Soni", 
                    "lead" : "PR Head", 
                    "write_up" : "Colour blind, but coloured mind. Knows his way through people very well!", 
                    "facebook" : "#", 
                    "insta" : "https://www.instagram.com/_takshsoni_", 
                    "linkedin" : "https://www.linkedin.com/in/taksh-soni-444990173/", 
                    "picture_loc" : "./media/team/Taksh_Soni.jpg"
                },
                {
                    "name" : "Vedant Mathur", 
                    "lead" : "Hospitality Head", 
                    "write_up" : "He lives his life one day at a time, with a fresh-baked cookie, maybe a coffee, and maybe some chocolates, if he likes you he’ll probably get you one too.",
                    "facebook" : "https://www.facebook.com/vedant.mathur.75/", 
                    "insta" : "https://www.instagram.com/v_mathur/",
                    "linkedin" : "https://www.linkedin.com/in/vedant-mathur/", 
                    "picture_loc" : "./media/team/Vedant_Mathur.jpg"
                },
                {
                    "name" : "Niharika Kadam", 
                    "lead" : "Operations Head", 
                    "write_up" : "Someone who gets well with all kinds of people and can be assertive without being rude!",
                    "facebook" : "#", 
                    "insta" : "https://www.instagram.com/niharikakadam",
                    "linkedin" : "https://www.linkedin.com/in/niharika-kadam-ab32071b8/", 
                    "picture_loc" : "./media/team/Niharika_Kadam.jpg"
                }
            ]
        }
        data = data["executive"];
        // speakers_data = JSON.parse(response);
        // console.log(data);
        for (var i in data) {
            // console.log(data[1]);
            // console.log(data[i].name);
            // console.log(data[i].picture_loc);
            executives_data.push(new Executive(data[i].name, data[i].lead, data[i].write_up, data[i].facebook, data[i].insta, data[i].linkedin, data[i].picture_loc));
        }
    // });
    // loadJSON("./json/archives_data.json", function(response) {
        data = {
            "archive" : [
                {
                    "name" : "Ayush Mehra", 
                    "talk" : "Enjoy the Jounrey", 
                    "link" : "https://www.youtube.com/embed/le6eNngljto"
                },
                {
                    "name" : "Kaam Bhari", 
                    "talk" : "Living Life One Verse at a Time", 
                    "link" : "https://www.youtube.com/embed/lGJoaVHYifU"
                },
                {
                    "name" : "Sumeet Vyas", 
                    "talk" : "Find Your Fuel", 
                    "link" : "https://www.youtube.com/embed/aWCDFi2tZiY"
                },
                {
                    "name" : "Eisha Chopra", 
                    "talk" : "The Power of an Audience to Change Society", 
                    "link" : "https://www.youtube.com/embed/zX-6UFQuiXk"
                },
                {
                    "name" : "Kavish Sinha", 
                    "talk" : "Passion, What?", 
                    "link" : "https://www.youtube.com/embed/eEknyfpLdLI"
                },
                {
                    "name" : "Ameya Kanawade", 
                    "talk" : "Fumbling My Way to Fluency, How I got over My Stutter",
                    "link" : "https://www.youtube.com/embed/xrXHYaUUNGU"
                },
                {
                    "name" : "Aakshaye Rathi", 
                    "talk" : "The Impact of OTT Platforms on Cinema", 
                    "link" : "https://www.youtube.com/embed/f8ppJS210RA"
                },
                {
                    "name" : "Ali Mustafa Shaikh", 
                    "talk" : "Crowd-sourcing Data for Machine Learning", 
                    "link" : "https://www.youtube.com/embed/wwZKOmoNxMo"
                }
            ]
        }
        data = data["archive"];
        // speakers_data = JSON.parse(response);
        // console.log(data);
        for (var i in data) {
            // console.log(data[1]);
            // console.log(data[i].name);
            archives_data.push(new Archive(data[i].name, data[i].talk, data[i].link));
        }
    // });
    // loadJSON("./json/archives_data_2018.json", function(response) {
        var data = {
            "archive" : [
                {
                    "name" : "Vikas Gupta", 
                    "talk" : "Finding Yourself", 
                    "link" : "https://www.youtube.com/embed/xjfVrWyU5oM"
                },
                {
                    "name" : "Manish Advani", 
                    "talk" : "The Art of Story Telling", 
                    "link" : "https://www.youtube.com/embed/-eXikXK9SZ8"
                },
                {
                    "name" : "Nidhika Bahl", 
                    "talk" : "The Art of Creating Meaningful and Everlasting Relationships", 
                    "link" : "https://www.youtube.com/embed/6YVMYI2qMFI"
                },
                {
                    "name" : "Rashi Mal", 
                    "talk" : "Choose the Life You Want to Live", 
                    "link" : "https://www.youtube.com/embed/3GLsR29QHAU"
                },
                {
                    "name" : "Swapan Rajdev", 
                    "talk" : "The Age of Artificial Intelligence", 
                    "link" : "https://www.youtube.com/embed/5FP0oqRUfHY"
                },
                {
                    "name" : "Mohsin Memon", 
                    "talk" : "Games can solve real problems",
                    "link" : "https://www.youtube.com/embed/7gT5gO107nE"
                },
                {
                    "name" : "Max Fernandes", 
                    "talk" : "Exploring the School of Art", 
                    "link" : "https://www.youtube.com/embed/f5kLOBzF34g"
                },
                {
                    "name" : "Robin Chaurasia", 
                    "talk" : "Social Change", 
                    "link" : "https://www.youtube.com/embed/qQ836w2kWf8"
                }
            ]
        }
        data = data["archive"];
        // speakers_data = JSON.parse(response);
        // console.log(data);
        for (var i in data) {
            // console.log(data[1]);
            // console.log(data[i].name);
            archives_2018_data.push(new Archive_2018(data[i].name, data[i].talk, data[i].link));
        }
    // });
}

window.addEventListener("card-arrow", function(e) {
    // console.log("Hello");
});

if (screen.width > 1024) {

    function shiftScaleUp(j, section_name) {
        j = j - 1;

        if (section_name == "speakers") {
            if (j == 0) {
                for (var i = 1; i < speaker_cards_len; i++) {
                    card = speaker_cards.children[i];
                    card.classList.add('shiftCardRight90');
                }
            } else if (j == (speaker_cards_len - 1)) {
                for (var i = 0; i < (speaker_cards_len - 1); i++) {
                    card = speaker_cards.children[i];
                    card.classList.add('shiftCardLeft90');
                }
            } else {
                for (var i = 0; i < j; i++) {
                    var card = speaker_cards.children[i];
                    card.classList.add('shiftCardLeft50');
                }

                for (var i = (j + 1); i < speaker_cards.childElementCount; i++) {
                    var card = speaker_cards.children[i];
                    card.classList.add('shiftCardRight50');
                }
            }
        } else if (section_name == "executives") {
            if (j == 0) {
                for (var i = 1; i < exec_cards_len; i++) {
                    card = exec_cards.children[i];
                    card.classList.add('shiftCardRight90');
                }
            } else if (j == (exec_cards_len - 1)) {
                for (var i = 0; i < (exec_cards_len - 1); i++) {
                    card = exec_cards.children[i];
                    card.classList.add('shiftCardLeft90');
                }
            } else {
                for (var i = 0; i < j; i++) {
                    var card = exec_cards.children[i];
                    card.classList.add('shiftCardLeft50');
                }

                for (var i = (j + 1); i < exec_cards.childElementCount; i++) {
                    var card = exec_cards.children[i];
                    card.classList.add('shiftCardRight50');
                }
            }
        } else if (section_name == "sponsors") {
            // if (j == 0) {
            //     for (var i = 1; i < spons_cards_len; i++) {
            //         card = spons_cards.children[i];
            //         card.classList.add('shiftCardRight90');
            //     }
            // } else if (j == (spons_cards_len - 1)) {
            //     for (var i = 0; i < (spons_cards_len - 1); i++) {
            //         card = spons_cards.children[i];
            //         card.classList.add('shiftCardLeft90');
            //     }
            // } else {
            //     for (var i = 0; i < j; i++) {
            //         var card = spons_cards.children[i];
            //         card.classList.add('shiftCardLeft50');
            //     }

            //     for (var i = (j + 1); i < spons_cards.childElementCount; i++) {
            //         var card = spons_cards.children[i];
            //         card.classList.add('shiftCardRight50');
            //     }
            // }
        } else if (section_name == "archive") {
            if (j == 0) {
                for (var i = 1; i < archive_cards_len; i++) {
                    card = archive_cards.children[i];
                    card.classList.add('shiftCardRight90');
                }
            } else if (j == (archive_cards_len - 1)) {
                for (var i = 0; i < (archive_cards_len - 1); i++) {
                    card = archive_cards.children[i];
                    card.classList.add('shiftCardLeft90');
                }
            } else {
                for (var i = 0; i < j; i++) {
                    var card = archive_cards.children[i];
                    card.classList.add('shiftCardLeft50');
                }

                for (var i = (j + 1); i < archive_cards.childElementCount; i++) {
                    var card = archive_cards.children[i];
                    card.classList.add('shiftCardRight50');
                }
            }
        } else if (section_name == "archive_2018") {
            if (j == 0) {
                for (var i = 1; i < archive_cards_2018_len; i++) {
                    card = archive_cards_2018.children[i];
                    card.classList.add('shiftCardRight90');
                }
            } else if (j == (archive_cards_2018_len - 1)) {
                for (var i = 0; i < (archive_cards_2018_len - 1); i++) {
                    card = archive_cards_2018.children[i];
                    card.classList.add('shiftCardLeft90');
                }
            } else {
                for (var i = 0; i < j; i++) {
                    var card = archive_cards_2018.children[i];
                    card.classList.add('shiftCardLeft50');
                }

                for (var i = (j + 1); i < archive_cards_2018.childElementCount; i++) {
                    var card = archive_cards_2018.children[i];
                    card.classList.add('shiftCardRight50');
                }
            }
        }
    }

    function shiftScaleDown(j, section_name) {
        j = j - 1;

        if (section_name == "speakers") {
            if (j == 0) {
                for (var i = 1; i < speaker_cards_len; i++) {
                    card = speaker_cards.children[i];
                    card.classList.remove('shiftCardRight90');
                }
            } else if (j == (speaker_cards_len - 1)) {
                for (var i = 0; i < (speaker_cards_len - 1); i++) {
                    card = speaker_cards.children[i];
                    card.classList.remove('shiftCardLeft90');
                }
            } else {
                for (var i = 0; i < j; i++) {
                    var card = speaker_cards.children[i];
                    card.classList.remove('shiftCardLeft50');
                }

                for (var i = (j + 1); i < speaker_cards.childElementCount; i++) {
                    var card = speaker_cards.children[i];
                    card.classList.remove('shiftCardRight50');
                }
            }
        } else if (section_name == "executives") {
            if (j == 0) {
                for (var i = 1; i < exec_cards_len; i++) {
                    card = exec_cards.children[i];
                    card.classList.remove('shiftCardRight90');
                }
            } else if (j == (exec_cards_len - 1)) {
                for (var i = 0; i < (exec_cards_len - 1); i++) {
                    card = exec_cards.children[i];
                    card.classList.remove('shiftCardLeft90');
                }
            } else {
                for (var i = 0; i < j; i++) {
                    var card = exec_cards.children[i];
                    card.classList.remove('shiftCardLeft50');
                }

                for (var i = (j + 1); i < exec_cards.childElementCount; i++) {
                    var card = exec_cards.children[i];
                    card.classList.remove('shiftCardRight50');
                }
            }
        } else if (section_name == "sponsors") {
            // if (j == 0) {
            //     for (var i = 1; i < spons_cards_len; i++) {
            //         card = spons_cards.children[i];
            //         card.classList.remove('shiftCardRight90');
            //     }
            // } else if (j == (spons_cards_len - 1)) {
            //     for (var i = 0; i < (spons_cards_len - 1); i++) {
            //         card = spons_cards.children[i];
            //         card.classList.remove('shiftCardLeft90');
            //     }
            // } else {
            //     for (var i = 0; i < j; i++) {
            //         var card = spons_cards.children[i];
            //         card.classList.remove('shiftCardLeft50');
            //     }

            //     for (var i = (j + 1); i < spons_cards.childElementCount; i++) {
            //         var card = spons_cards.children[i];
            //         card.classList.remove('shiftCardRight50');
            //     }
            // }
        } else if (section_name == "archive") {
            if (j == 0) {
                for (var i = 1; i < archive_cards_len; i++) {
                    card = archive_cards.children[i];
                    card.classList.remove('shiftCardRight90');
                }
            } else if (j == (archive_cards_len - 1)) {
                for (var i = 0; i < (archive_cards_len - 1); i++) {
                    card = archive_cards.children[i];
                    card.classList.remove('shiftCardLeft90');
                }
            } else {
                for (var i = 0; i < j; i++) {
                    var card = archive_cards.children[i];
                    card.classList.remove('shiftCardLeft50');
                }

                for (var i = (j + 1); i < archive_cards.childElementCount; i++) {
                    var card = archive_cards.children[i];
                    card.classList.remove('shiftCardRight50');
                }
            }
        } else if (section_name == "archive_2018") {
            if (j == 0) {
                for (var i = 1; i < archive_cards_2018_len; i++) {
                    card = archive_cards_2018.children[i];
                    card.classList.remove('shiftCardRight90');
                }
            } else if (j == (archive_cards_2018_len - 1)) {
                for (var i = 0; i < (archive_cards_2018_len - 1); i++) {
                    card = archive_cards_2018.children[i];
                    card.classList.remove('shiftCardLeft90');
                }
            } else {
                for (var i = 0; i < j; i++) {
                    var card = archive_cards_2018.children[i];
                    card.classList.remove('shiftCardLeft50');
                }

                for (var i = (j + 1); i < archive_cards_2018.childElementCount; i++) {
                    var card = archive_cards_2018.children[i];
                    card.classList.remove('shiftCardRight50');
                }
            }
        }
    }


    // Write function to change values of speaker-info class div based on button click.
    function generate(j, type) {

        j = j - 1;

        if (type == "speakers") {
            var speaker = speakers_data[j];
            var text = speaker_info.children[0].children;
            var image = speaker_info.children[1].children;
            var social = speaker_info.children[0].children[4];

            text[0].innerHTML = speaker["name"];
            // console.log(speaker["name"]);
            text[1].innerHTML = speaker["occupation"];
            // console.log(speaker["occupation"]);
            text[2].innerText = speaker["talk"];
            // console.log(speaker["talk"]);
            text[3].innerText = speaker["write_up"];
            // console.log(speaker["write_up"]);

            social.children[0].children[0].href = speaker["lin"];
            if (speaker["lin"] == "#") {
                social.children[0].style.display = "none";
            }
            // console.log(executive["lin"]);
            social.children[1].children[0].href = speaker["insta"];
            if (speaker["insta"] == "#") {
                social.children[1].style.display = "none";
            }
            // console.log(executive["insta"]);
            social.children[2].children[0].href = speaker["fb"];
            if (speaker["fb"] == "#") {
                social.children[2].style.display = "none";
            }
            // console.log(executive["fb"]);

            image[0].srcset = speaker["picture"];

            speaker_info.classList.remove('pull-animation');
            speaker_info.classList.add('drop-animation');
        } else if (type == "executives") {
            var executive = executives_data[j];
            executive_info.children[0].children[0]
            var text = executive_info.children[0].children[0].children;
            var image = executive_info.children[1].children;
            var social = executive_info.children[0].children[0].children[3];

            text[0].innerHTML = executive["name"];
            // console.log(executive["name"]);
            text[1].innerHTML = executive["post"];
            // console.log(executive["post"]);
            text[2].innerText = executive["write_up"];
            // console.log(executive["write_up"]);

            social.children[0].children[0].href = executive["lin"];
            // console.log(executive["lin"]);
            social.children[1].children[0].href = executive["insta"];
            // console.log(executive["insta"]);
            social.children[2].children[0].href = executive["fb"];
            // console.log(executive["fb"]);

            image[0].srcset = executive["picture"];
            // console.log(executive["picture"]);

            if (j == 9 || j == 10) {
                executive_info.children[1].children[1].style.background = "radial-gradient(circle at 55%, rgba(0, 0, 0, 0), rgba(0, 0, 0, 1) 70%)";
            }

            executive_info.classList.remove('pull-animation');
            executive_info.classList.add('drop-animation');
            // executive_info.style.display = "flex";
        } else if (type == "archives") {
            var archive = archives_data[j];
            var video = archive_info.children[0].children[0];

            // console.log(archive["link"]);
            video.src = archive["link"];

            archive_info.style.display = "block";
        } else if (type == "archives_2018") {
            var archive = archives_2018_data[j];
            var video = archive_info_2018.children[0].children[0];

            // console.log(archive["link"]);
            video.src = archive["link"];

            archive_info_2018.style.display = "block";
        }
    }

    $("#close-btn-speakers").click(e => {
        var social = speaker_info.children[0].children[4];
        social.children[0].style.display = "block";
        social.children[1].style.display = "block";
        social.children[2].style.display = "block";
        speaker_info.classList.add('pull-animation');
        speaker_info.classList.remove('drop-animation');
        // speaker_info.style.display = "none";
    });
    $("#close-btn-executives").click(e => {
        // if(j == 9 || j == 10){
        //     executive_info.children[1].children[1].style.background = "none";
        // }
        executive_info.classList.add('pull-animation');
        executive_info.classList.remove('drop-animation');
        // executive_info.style.display = "none";
    });
    $("#archives-info").click(e => {
        archive_info.children[0].children[0].src = "";
        archive_info.style.display = "none";
    });
    $("#archives-info-2018").click(e => {
        archive_info_2018.children[0].children[0].src = "";
        archive_info_2018.style.display = "none";
    });


    ///// SCROLL FUNCTIONS /////
    const margin = window.innerWidth * 5 / 100;
    const cardWidth = 375;

    // Speakers Variables
    const noOfSpeakers = 6;
    let counter_sp = 0;
    let pushedBy_sp = 0;

    // Executive Variables
    const noOfExecutives = 15;
    let counter_ex = 0;
    let pushedBy_ex = 0;

    // Sponsors Variables
    // const noOfSponsors = 12;
    // let counter_spon = 0;
    // let pushedBy_spon = 0;

    // Archive Variables
    const noOfArchives = 8;
    let counter_ar = 0;
    let pushedBy_ar = 0;

    // document.getElementsByClassName("section")[i].children[1].children[1].clientWidth / 395
    // document.getElementsByClassName("left-button")[i].parentElement.parentElement.parentElement.id
    $(".left-button").on('click', function() {
        // console.log($(this));
        // console.log($(this).parent().parent().parent().attr('id'));
        var section = $(this).parent().parent().parent().attr('id');
        // console.log($('#' + section));
        // console.log($('#' + section).children(".real-content").children(".cards"));
        var cards = $('#' + section).children(".real-content").children(".cards");
        // console.log(cards);
        var sectionWidth = cards.innerWidth();
        var noOfCards = Math.floor(sectionWidth / cardWidth);
        var noOfActualCards = 0;
        var counter = 0;
        var pushedBy = 0;
        switch (section) {
            case ("speakers"):
                {
                    noOfActualCards = noOfSpeakers;
                    counter = counter_sp;
                    pushedBy = pushedBy_sp;
                    break;
                }
            case ("executives"):
                {
                    noOfActualCards = noOfExecutives;
                    counter = counter_ex;
                    pushedBy = pushedBy_ex;
                    break;
                }
            // case ("sponsors"):
            //     {
            //         noOfActualCards = noOfSponsors;
            //         counter = counter_spon;
            //         pushedBy = pushedBy_spon;
            //         break;
            //     }
            case ("archives"):
                {
                    noOfActualCards = noOfArchives;
                    counter = counter_ar;
                    pushedBy = pushedBy_ar;
                    break;
                }
            case ("archives_2018"):
                {
                    noOfActualCards = noOfArchives;
                    counter = counter_ar;
                    pushedBy = pushedBy_ar;
                    break;
                }
        }
        var num = noOfActualCards - noOfCards;
        if (counter > 1) {
            console.log(counter);
            cards.css("transition", "transform 0.4s ease-in-out");
            pushedBy -= cardWidth;
            console.log(pushedBy);
            cards.css("transform", 'translateX(-' + pushedBy + 'px)');
            counter--;
            switch (section) {
                case ("speakers"):
                    {
                        pushedBy_sp = pushedBy;
                        counter_sp = counter;
                        break;
                    }
                case ("executives"):
                    {
                        pushedBy_ex = pushedBy;
                        counter_ex = counter;
                        break;
                    }
                // case ("sponsors"):
                //     {
                //         pushedBy_spon = pushedBy;
                //         counter_spon = counter;
                //         break;
                //     }
                case ("archives"):
                    {
                        pushedBy_ar = pushedBy;
                        counter_ar = counter;
                        break;
                    }
                case ("archives_2018"):
                    {
                        pushedBy_ar = pushedBy;
                        counter_ar = counter;
                        break;
                    }
            }
        } else if (counter == 1 || counter == num) {
            console.log(counter);
            cards.css("transition", "transform 0.4s ease-in-out");
            pushedBy -= (margin + cardWidth);
            if (pushedBy < 0) {
                pushedBy = 0;
            }
            console.log(pushedBy);
            cards.css("transform", 'translateX(-' + pushedBy + 'px)');
            counter--;
            switch (section) {
                case ("speakers"):
                    {
                        pushedBy_sp = pushedBy;
                        counter_sp = counter;
                        break;
                    }
                case ("executives"):
                    {
                        pushedBy_ex = pushedBy;
                        counter_ex = counter;
                        break;
                    }
                // case ("sponsors"):
                //     {
                //         pushedBy_spon = pushedBy;
                //         counter_spon = counter;
                //         break;
                //     }
                case ("archives"):
                    {
                        pushedBy_ar = pushedBy;
                        counter_ar = counter;
                        break;
                    }
                case ("archives_2018"):
                    {
                        pushedBy_ar = pushedBy;
                        counter_ar = counter;
                        break;
                    }
            }
        } // else if(counter == 0){
        //     console.log(counter);
        //     cards.css("transition", "transform 0.4s ease-in-out");
        //     pushedBy -= (margin);
        //     cards.css("transform", 'translateX(-'+pushedBy+'px)');
        //     counter--;
        //     switch(section){
        //         case("speakers"):{
        //             pushedBy_sp = pushedBy;
        //             counter_sp = counter;
        //             break;
        //         }
        //         case("executives"):{
        //             pushedBy_ex = pushedBy;
        //             counter_ex = counter;
        //             break;
        //         }
        //         case("sponsors"):{
        //             pushedBy_spon = pushedBy;
        //             counter_spon = counter;
        //             break;
        //         }
        //         case("archives"):{
        //             pushedBy_ar = pushedBy;
        //             counter_ar = counter;
        //             break;
        //         }
        //     }
        // }
    });
    $(".right-button").on('click', function() {
        // console.log($(this));
        // console.log($(this).parent().parent().parent().attr('id'));
        var section = $(this).parent().parent().parent().attr('id');
        // console.log($('#' + section));
        // console.log($('#' + section).children(".real-content").children(".cards"));
        var cards = $('#' + section).children(".real-content").children(".cards");
        var sectionWidth = cards.innerWidth();
        var noOfCards = Math.floor(sectionWidth / cardWidth);
        // console.log(noOfCards);
        var noOfActualCards = 0;
        var counter = 0;
        var pushedBy = 0;
        switch (section) {
            case ("speakers"):
                {
                    noOfActualCards = noOfSpeakers;
                    counter = counter_sp;
                    pushedBy = pushedBy_sp;
                    break;
                }
            case ("executives"):
                {
                    noOfActualCards = noOfExecutives;
                    counter = counter_ex;
                    pushedBy = pushedBy_ex;
                    break;
                }
            // case ("sponsors"):
            //     {
            //         noOfActualCards = noOfSponsors;
            //         counter = counter_spon;
            //         pushedBy = pushedBy_spon;
            //         break;
            //     }
            case ("archives"):
                {
                    noOfActualCards = noOfArchives;
                    counter = counter_ar;
                    pushedBy = pushedBy_ar;
                    break;
                }
            case ("archives_2018"):
                {
                    noOfActualCards = noOfArchives;
                    counter = counter_ar;
                    pushedBy = pushedBy_ar;
                    break;
                }
        }
        var num = noOfActualCards - noOfCards;
        if (counter == 0) {
            console.log(counter);
            cards.css("transition", "transform 0.4s ease-in-out");
            pushedBy += (margin + cardWidth);
            cards.css("transform", 'translateX(-' + pushedBy + 'px)');
            counter++;
            switch (section) {
                case ("speakers"):
                    {
                        pushedBy_sp = pushedBy;
                        counter_sp = counter;
                        break;
                    }
                case ("executives"):
                    {
                        pushedBy_ex = pushedBy;
                        counter_ex = counter;
                        break;
                    }
                // case ("sponsors"):
                //     {
                //         pushedBy_spon = pushedBy;
                //         counter_spon = counter;
                //         break;
                //     }
                case ("archives"):
                    {
                        pushedBy_ar = pushedBy;
                        counter_ar = counter;
                        break;
                    }
                case ("archives_2018"):
                    {
                        pushedBy_ar = pushedBy;
                        counter_ar = counter;
                        break;
                    }
            }
        } else if (counter < num) {
            console.log(counter);
            cards.css("transition", "transform 0.4s ease-in-out");
            pushedBy += cardWidth;
            cards.css("transform", 'translateX(-' + pushedBy + 'px)');
            counter++;
            switch (section) {
                case ("speakers"):
                    {
                        pushedBy_sp = pushedBy;
                        counter_sp = counter;
                        break;
                    }
                case ("executives"):
                    {
                        pushedBy_ex = pushedBy;
                        counter_ex = counter;
                        break;
                    }
                // case ("sponsors"):
                //     {
                //         pushedBy_spon = pushedBy;
                //         counter_spon = counter;
                //         break;
                //     }
                case ("archives"):
                    {
                        pushedBy_ar = pushedBy;
                        counter_ar = counter;
                        break;
                    }
                case ("archives_2018"):
                    {
                        pushedBy_ar = pushedBy;
                        counter_ar = counter;
                        break;
                    }
            }
        } // else if(counter == num){
        //     console.log(counter);
        //     cards.css("transition", "transform 0.4s ease-in-out");
        //     pushedBy += margin;
        //     cards.css("transform", 'translateX(-'+pushedBy+'px)');
        //     counter++;
        //     switch(section){
        //         case("speakers"):{
        //             pushedBy_sp = pushedBy;
        //             counter_sp = counter;
        //             break;
        //         }
        //         case("executives"):{
        //             pushedBy_ex = pushedBy;
        //             counter_ex = counter;
        //             break;
        //         }
        //         case("sponsors"):{
        //             pushedBy_spon = pushedBy;
        //             counter_spon = counter;
        //             break;
        //         }
        //         case("archives"):{
        //             pushedBy_ar = pushedBy;
        //             counter_ar = counter;
        //             break;
        //         }
        //     }
        // }
    });

}
// Tablets View
else if (screen.width >= 768 && screen.width <= 1024) {

    function shiftScaleUp(j, section_name) {
        j = j - 1;

        if (section_name == "speakers") {
            console.log("Hello");
            // generate(j, section_name);
            // if (j == 0) {
            // 	for (var i = 1; i < speaker_cards_len; i++) {
            // 		card = speaker_cards.children[i];
            // 		card.classList.add('shiftCardRight90');
            // 	}
            // } else if (j == (speaker_cards_len - 1)) {
            // 	for (var i = 0; i < (speaker_cards_len - 1); i++) {
            // 		card = speaker_cards.children[i];
            // 		card.classList.add('shiftCardLeft90');
            // 	}
            // } else {
            // 	for (var i = 0; i < j; i++) {
            // 		var card = speaker_cards.children[i];
            // 		card.classList.add('shiftCardLeft50');
            // 	}

            // 	for (var i = (j + 1); i < speaker_cards.childElementCount; i++) {
            // 		var card = speaker_cards.children[i];
            // 		card.classList.add('shiftCardRight50');
            // 	}
            // }
        } else if (section_name == "executives") {
            console.log("Hello");
            // generate(j, section_name);
            // if (j == 0) {
            // 	for (var i = 1; i < exec_cards_len; i++) {
            // 		card = exec_cards.children[i];
            // 		card.classList.add('shiftCardRight90');
            // 	}
            // } else if (j == (exec_cards_len - 1)) {
            // 	for (var i = 0; i < (exec_cards_len - 1); i++) {
            // 		card = exec_cards.children[i];
            // 		card.classList.add('shiftCardLeft90');
            // 	}
            // } else {
            // 	for (var i = 0; i < j; i++) {
            // 		var card = exec_cards.children[i];
            // 		card.classList.add('shiftCardLeft50');
            // 	}

            // 	for (var i = (j + 1); i < exec_cards.childElementCount; i++) {
            // 		var card = exec_cards.children[i];
            // 		card.classList.add('shiftCardRight50');
            // 	}
            // }
        } else if (section_name == "sponsors") {
            // if (j == 0) {
            //     for (var i = 1; i < spons_cards_len; i++) {
            //         card = spons_cards.children[i];
            //         card.classList.add('shiftCardRight90');
            //     }
            // } else if (j == (spons_cards_len - 1)) {
            //     for (var i = 0; i < (spons_cards_len - 1); i++) {
            //         card = spons_cards.children[i];
            //         card.classList.add('shiftCardLeft90');
            //     }
            // } else {
            //     for (var i = 0; i < j; i++) {
            //         var card = spons_cards.children[i];
            //         card.classList.add('shiftCardLeft50');
            //     }

            //     for (var i = (j + 1); i < spons_cards.childElementCount; i++) {
            //         var card = spons_cards.children[i];
            //         card.classList.add('shiftCardRight50');
            //     }
            // }
        } else if (section_name == "archive") {
            if (j == 0) {
                for (var i = 1; i < archive_cards_len; i++) {
                    card = archive_cards.children[i];
                    card.classList.add('shiftCardRight90');
                }
            } else if (j == (archive_cards_len - 1)) {
                for (var i = 0; i < (archive_cards_len - 1); i++) {
                    card = archive_cards.children[i];
                    card.classList.add('shiftCardLeft90');
                }
            } else {
                for (var i = 0; i < j; i++) {
                    var card = archive_cards.children[i];
                    card.classList.add('shiftCardLeft50');
                }

                for (var i = (j + 1); i < archive_cards.childElementCount; i++) {
                    var card = archive_cards.children[i];
                    card.classList.add('shiftCardRight50');
                }
            }
        } else if (section_name == "archive_2018") {
            if (j == 0) {
                for (var i = 1; i < archive_cards_2018_len; i++) {
                    card = archive_cards_2018.children[i];
                    card.classList.add('shiftCardRight90');
                }
            } else if (j == (archive_cards_2018_len - 1)) {
                for (var i = 0; i < (archive_cards_2018_len - 1); i++) {
                    card = archive_cards_2018.children[i];
                    card.classList.add('shiftCardLeft90');
                }
            } else {
                for (var i = 0; i < j; i++) {
                    var card = archive_cards_2018.children[i];
                    card.classList.add('shiftCardLeft50');
                }

                for (var i = (j + 1); i < archive_cards_2018.childElementCount; i++) {
                    var card = archive_cards_2018.children[i];
                    card.classList.add('shiftCardRight50');
                }
            }
        }
    }

    function shiftScaleDown(j, section_name) {
        j = j - 1;

        if (section_name == "speakers") {
            console.log("Hello");
            // if (j == 0) {
            // 	for (var i = 1; i < speaker_cards_len; i++) {
            // 		card = speaker_cards.children[i];
            // 		card.classList.remove('shiftCardRight90');
            // 	}
            // } else if (j == (speaker_cards_len - 1)) {
            // 	for (var i = 0; i < (speaker_cards_len - 1); i++) {
            // 		card = speaker_cards.children[i];
            // 		card.classList.remove('shiftCardLeft90');
            // 	}
            // } else {
            // 	for (var i = 0; i < j; i++) {
            // 		var card = speaker_cards.children[i];
            // 		card.classList.remove('shiftCardLeft50');
            // 	}

            // 	for (var i = (j + 1); i < speaker_cards.childElementCount; i++) {
            // 		var card = speaker_cards.children[i];
            // 		card.classList.remove('shiftCardRight50');
            // 	}
            // }
        } else if (section_name == "executives") {
            console.log("Hello");
            // if (j == 0) {
            // 	for (var i = 1; i < exec_cards_len; i++) {
            // 		card = exec_cards.children[i];
            // 		card.classList.remove('shiftCardRight90');
            // 	}
            // } else if (j == (exec_cards_len - 1)) {
            // 	for (var i = 0; i < (exec_cards_len - 1); i++) {
            // 		card = exec_cards.children[i];
            // 		card.classList.remove('shiftCardLeft90');
            // 	}
            // } else {
            // 	for (var i = 0; i < j; i++) {
            // 		var card = exec_cards.children[i];
            // 		card.classList.remove('shiftCardLeft50');
            // 	}

            // 	for (var i = (j + 1); i < exec_cards.childElementCount; i++) {
            // 		var card = exec_cards.children[i];
            // 		card.classList.remove('shiftCardRight50');
            // 	}
            // }
        } else if (section_name == "sponsors") {
            // if (j == 0) {
            //     for (var i = 1; i < spons_cards_len; i++) {
            //         card = spons_cards.children[i];
            //         card.classList.remove('shiftCardRight90');
            //     }
            // } else if (j == (spons_cards_len - 1)) {
            //     for (var i = 0; i < (spons_cards_len - 1); i++) {
            //         card = spons_cards.children[i];
            //         card.classList.remove('shiftCardLeft90');
            //     }
            // } else {
            //     for (var i = 0; i < j; i++) {
            //         var card = spons_cards.children[i];
            //         card.classList.remove('shiftCardLeft50');
            //     }

            //     for (var i = (j + 1); i < spons_cards.childElementCount; i++) {
            //         var card = spons_cards.children[i];
            //         card.classList.remove('shiftCardRight50');
            //     }
            // }
        } else if (section_name == "archive") {
            if (j == 0) {
                for (var i = 1; i < archive_cards_len; i++) {
                    card = archive_cards.children[i];
                    card.classList.remove('shiftCardRight90');
                }
            } else if (j == (archive_cards_len - 1)) {
                for (var i = 0; i < (archive_cards_len - 1); i++) {
                    card = archive_cards.children[i];
                    card.classList.remove('shiftCardLeft90');
                }
            } else {
                for (var i = 0; i < j; i++) {
                    var card = archive_cards.children[i];
                    card.classList.remove('shiftCardLeft50');
                }

                for (var i = (j + 1); i < archive_cards.childElementCount; i++) {
                    var card = archive_cards.children[i];
                    card.classList.remove('shiftCardRight50');
                }
            }
        } else if (section_name == "archive_2018") {
            if (j == 0) {
                for (var i = 1; i < archive_cards_2018_len; i++) {
                    card = archive_cards_2018.children[i];
                    card.classList.remove('shiftCardRight90');
                }
            } else if (j == (archive_cards_2018_len - 1)) {
                for (var i = 0; i < (archive_cards_2018_len - 1); i++) {
                    card = archive_cards_2018.children[i];
                    card.classList.remove('shiftCardLeft90');
                }
            } else {
                for (var i = 0; i < j; i++) {
                    var card = archive_cards_2018.children[i];
                    card.classList.remove('shiftCardLeft50');
                }

                for (var i = (j + 1); i < archive_cards_2018.childElementCount; i++) {
                    var card = archive_cards_2018.children[i];
                    card.classList.remove('shiftCardRight50');
                }
            }
        }
    }


    // Write function to change values of speaker-info class div based on button click.
    function generate(j, type) {

        j = j - 1;

        if (type == "speakers") {
            var speaker = speakers_data[j];
            var text = speaker_info.children[0].children;
            var image = speaker_info.children[1].children;
            var social = speaker_info.children[0].children[4];

            text[0].innerHTML = speaker["name"];
            // console.log(speaker["name"]);
            text[1].innerHTML = speaker["occupation"];
            // console.log(speaker["occupation"]);
            text[2].innerText = speaker["talk"];
            // console.log(speaker["talk"]);
            text[3].innerText = speaker["write_up"];
            // console.log(speaker["write_up"]);

            social.children[0].children[0].href = speaker["lin"];
            if (speaker["lin"] == "#") {
                social.children[0].style.display = "none";
            }
            // console.log(executive["lin"]);
            social.children[1].children[0].href = speaker["insta"];
            if (speaker["insta"] == "#") {
                social.children[1].style.display = "none";
            }
            // console.log(executive["insta"]);
            social.children[2].children[0].href = speaker["fb"];
            if (speaker["fb"] == "#") {
                social.children[2].style.display = "none";
            }
            // console.log(executive["fb"]);

            image[0].srcset = speaker["picture"];

            // speaker_info.classList.remove('pull-animation');
            // speaker_info.classList.add('drop-animation');
            speaker_info.style.display = "flex";
        } else if (type == "executives") {
            var executive = executives_data[j];
            executive_info.children[0].children[0]
            var text = executive_info.children[0].children[0].children;
            var image = executive_info.children[1].children;
            var social = executive_info.children[0].children[0].children[3];

            text[0].innerHTML = executive["name"];
            console.log(executive["name"]);
            text[1].innerHTML = executive["post"];
            // console.log(executive["post"]);
            text[2].innerText = executive["write_up"];
            // console.log(executive["write_up"]);

            social.children[0].children[0].href = executive["lin"];
            // console.log(executive["lin"]);
            social.children[1].children[0].href = executive["insta"];
            // console.log(executive["insta"]);
            social.children[2].children[0].href = executive["fb"];
            // console.log(executive["fb"]);

            image[0].srcset = executive["picture"];
            // console.log(executive["picture"]);

            if (j == 9 || j == 10) {
                executive_info.children[1].children[1].style.background = "radial-gradient(circle at 55%, rgba(0, 0, 0, 0), rgba(0, 0, 0, 1) 70%)";
            }

            // executive_info.classList.remove('pull-animation');
            // executive_info.classList.add('drop-animation');
            executive_info.style.display = "flex";
        } else if (type == "archives") {
            var archive = archives_data[j];
            var video = archive_info.children[0].children[0];

            // console.log(archive["link"]);
            window.open(archive["link"]);

            // archive_info.style.display = "block";
        } else if (type == "archives_2018") {
            var archive = archives_2018_data[j];
            var video = archive_info_2018.children[0].children[0];

            // console.log(archive["link"]);
            window.open(archive["link"]);

            // archive_info.style.display = "block";
        }
    }

    $("#close-btn-speakers").click(e => {
        var social = speaker_info.children[0].children[4];
        social.children[0].style.display = "block";
        social.children[1].style.display = "block";
        social.children[2].style.display = "block";
        // speaker_info.classList.add('pull-animation');
        // speaker_info.classList.remove('drop-animation');
        speaker_info.style.display = "none";
    });
    $("#close-btn-executives").click(e => {
        // if(j == 9 || j == 10){
        //     executive_info.children[1].children[1].style.background = "none";
        // }
        // executive_info.classList.add('pull-animation');
        // executive_info.classList.remove('drop-animation');
        executive_info.style.display = "none";
    });
    $("#archives-info").click(e => {
        archive_info.children[0].children[0].src = "";
        archive_info.style.display = "none";
    });
    $("#archives-info-2018").click(e => {
        archive_info_2018.children[0].children[0].src = "";
        archive_info_2018.style.display = "none";
    });
}
// Mobile View
else if (screen.width < 768) {

    function shiftScaleUp(j, section_name) {
        j = j - 1;

        if (section_name == "speakers") {
            console.log("Hello");
            // generate(j, section_name);
            // if (j == 0) {
            // 	for (var i = 1; i < speaker_cards_len; i++) {
            // 		card = speaker_cards.children[i];
            // 		card.classList.add('shiftCardRight90');
            // 	}
            // } else if (j == (speaker_cards_len - 1)) {
            // 	for (var i = 0; i < (speaker_cards_len - 1); i++) {
            // 		card = speaker_cards.children[i];
            // 		card.classList.add('shiftCardLeft90');
            // 	}
            // } else {
            // 	for (var i = 0; i < j; i++) {
            // 		var card = speaker_cards.children[i];
            // 		card.classList.add('shiftCardLeft50');
            // 	}

            // 	for (var i = (j + 1); i < speaker_cards.childElementCount; i++) {
            // 		var card = speaker_cards.children[i];
            // 		card.classList.add('shiftCardRight50');
            // 	}
            // }
        } else if (section_name == "executives") {
            console.log("Hello");
            // generate(j, section_name);
            // if (j == 0) {
            // 	for (var i = 1; i < exec_cards_len; i++) {
            // 		card = exec_cards.children[i];
            // 		card.classList.add('shiftCardRight90');
            // 	}
            // } else if (j == (exec_cards_len - 1)) {
            // 	for (var i = 0; i < (exec_cards_len - 1); i++) {
            // 		card = exec_cards.children[i];
            // 		card.classList.add('shiftCardLeft90');
            // 	}
            // } else {
            // 	for (var i = 0; i < j; i++) {
            // 		var card = exec_cards.children[i];
            // 		card.classList.add('shiftCardLeft50');
            // 	}

            // 	for (var i = (j + 1); i < exec_cards.childElementCount; i++) {
            // 		var card = exec_cards.children[i];
            // 		card.classList.add('shiftCardRight50');
            // 	}
            // }
        } else if (section_name == "sponsors") {
            // if (j == 0) {
            //     for (var i = 1; i < spons_cards_len; i++) {
            //         card = spons_cards.children[i];
            //         card.classList.add('shiftCardRight90');
            //     }
            // } else if (j == (spons_cards_len - 1)) {
            //     for (var i = 0; i < (spons_cards_len - 1); i++) {
            //         card = spons_cards.children[i];
            //         card.classList.add('shiftCardLeft90');
            //     }
            // } else {
            //     for (var i = 0; i < j; i++) {
            //         var card = spons_cards.children[i];
            //         card.classList.add('shiftCardLeft50');
            //     }

            //     for (var i = (j + 1); i < spons_cards.childElementCount; i++) {
            //         var card = spons_cards.children[i];
            //         card.classList.add('shiftCardRight50');
            //     }
            // }
        } else if (section_name == "archive") {
            if (j == 0) {
                for (var i = 1; i < archive_cards_len; i++) {
                    card = archive_cards.children[i];
                    card.classList.add('shiftCardRight90');
                }
            } else if (j == (archive_cards_len - 1)) {
                for (var i = 0; i < (archive_cards_len - 1); i++) {
                    card = archive_cards.children[i];
                    card.classList.add('shiftCardLeft90');
                }
            } else {
                for (var i = 0; i < j; i++) {
                    var card = archive_cards.children[i];
                    card.classList.add('shiftCardLeft50');
                }

                for (var i = (j + 1); i < archive_cards.childElementCount; i++) {
                    var card = archive_cards.children[i];
                    card.classList.add('shiftCardRight50');
                }
            }
        } else if (section_name == "archive_2018") {
            if (j == 0) {
                for (var i = 1; i < archive_cards_2018_len; i++) {
                    card = archive_cards_2018.children[i];
                    card.classList.add('shiftCardRight90');
                }
            } else if (j == (archive_cards_2018_len - 1)) {
                for (var i = 0; i < (archive_cards_2018_len - 1); i++) {
                    card = archive_cards_2018.children[i];
                    card.classList.add('shiftCardLeft90');
                }
            } else {
                for (var i = 0; i < j; i++) {
                    var card = archive_cards_2018.children[i];
                    card.classList.add('shiftCardLeft50');
                }

                for (var i = (j + 1); i < archive_cards_2018.childElementCount; i++) {
                    var card = archive_cards_2018.children[i];
                    card.classList.add('shiftCardRight50');
                }
            }
        }
    }

    function shiftScaleDown(j, section_name) {
        j = j - 1;

        if (section_name == "speakers") {
            console.log("Hello");
            // if (j == 0) {
            // 	for (var i = 1; i < speaker_cards_len; i++) {
            // 		card = speaker_cards.children[i];
            // 		card.classList.remove('shiftCardRight90');
            // 	}
            // } else if (j == (speaker_cards_len - 1)) {
            // 	for (var i = 0; i < (speaker_cards_len - 1); i++) {
            // 		card = speaker_cards.children[i];
            // 		card.classList.remove('shiftCardLeft90');
            // 	}
            // } else {
            // 	for (var i = 0; i < j; i++) {
            // 		var card = speaker_cards.children[i];
            // 		card.classList.remove('shiftCardLeft50');
            // 	}

            // 	for (var i = (j + 1); i < speaker_cards.childElementCount; i++) {
            // 		var card = speaker_cards.children[i];
            // 		card.classList.remove('shiftCardRight50');
            // 	}
            // }
        } else if (section_name == "executives") {
            console.log("Hello");
            // if (j == 0) {
            // 	for (var i = 1; i < exec_cards_len; i++) {
            // 		card = exec_cards.children[i];
            // 		card.classList.remove('shiftCardRight90');
            // 	}
            // } else if (j == (exec_cards_len - 1)) {
            // 	for (var i = 0; i < (exec_cards_len - 1); i++) {
            // 		card = exec_cards.children[i];
            // 		card.classList.remove('shiftCardLeft90');
            // 	}
            // } else {
            // 	for (var i = 0; i < j; i++) {
            // 		var card = exec_cards.children[i];
            // 		card.classList.remove('shiftCardLeft50');
            // 	}

            // 	for (var i = (j + 1); i < exec_cards.childElementCount; i++) {
            // 		var card = exec_cards.children[i];
            // 		card.classList.remove('shiftCardRight50');
            // 	}
            // }
        } else if (section_name == "sponsors") {
            // if (j == 0) {
            //     for (var i = 1; i < spons_cards_len; i++) {
            //         card = spons_cards.children[i];
            //         card.classList.remove('shiftCardRight90');
            //     }
            // } else if (j == (spons_cards_len - 1)) {
            //     for (var i = 0; i < (spons_cards_len - 1); i++) {
            //         card = spons_cards.children[i];
            //         card.classList.remove('shiftCardLeft90');
            //     }
            // } else {
            //     for (var i = 0; i < j; i++) {
            //         var card = spons_cards.children[i];
            //         card.classList.remove('shiftCardLeft50');
            //     }

            //     for (var i = (j + 1); i < spons_cards.childElementCount; i++) {
            //         var card = spons_cards.children[i];
            //         card.classList.remove('shiftCardRight50');
            //     }
            // }
        } else if (section_name == "archive") {
            if (j == 0) {
                for (var i = 1; i < archive_cards_len; i++) {
                    card = archive_cards.children[i];
                    card.classList.remove('shiftCardRight90');
                }
            } else if (j == (archive_cards_len - 1)) {
                for (var i = 0; i < (archive_cards_len - 1); i++) {
                    card = archive_cards.children[i];
                    card.classList.remove('shiftCardLeft90');
                }
            } else {
                for (var i = 0; i < j; i++) {
                    var card = archive_cards.children[i];
                    card.classList.remove('shiftCardLeft50');
                }

                for (var i = (j + 1); i < archive_cards.childElementCount; i++) {
                    var card = archive_cards.children[i];
                    card.classList.remove('shiftCardRight50');
                }
            }
        } else if (section_name == "archive_2018") {
            if (j == 0) {
                for (var i = 1; i < archive_cards_2018_len; i++) {
                    card = archive_cards_2018.children[i];
                    card.classList.remove('shiftCardRight90');
                }
            } else if (j == (archive_cards_2018_len - 1)) {
                for (var i = 0; i < (archive_cards_2018_len - 1); i++) {
                    card = archive_cards_2018.children[i];
                    card.classList.remove('shiftCardLeft90');
                }
            } else {
                for (var i = 0; i < j; i++) {
                    var card = archive_cards_2018.children[i];
                    card.classList.remove('shiftCardLeft50');
                }

                for (var i = (j + 1); i < archive_cards_2018.childElementCount; i++) {
                    var card = archive_cards_2018.children[i];
                    card.classList.remove('shiftCardRight50');
                }
            }
        }
    }


    // Write function to change values of speaker-info class div based on button click.
    function generate(j, type) {

        j = j - 1;

        if (type == "speakers") {
            var speaker = speakers_data[j];
            var text = speaker_info.children[0].children;
            var image = speaker_info.children[1].children;
            var social = speaker_info.children[0].children[4];

            text[0].innerHTML = speaker["name"];
            // console.log(speaker["name"]);
            text[1].innerHTML = speaker["occupation"];
            // console.log(speaker["occupation"]);
            text[2].innerText = speaker["talk"];
            // console.log(speaker["talk"]);
            text[3].innerText = speaker["write_up"];
            // console.log(speaker["write_up"]);

            social.children[0].children[0].href = speaker["lin"];
            if (speaker["lin"] == "#") {
                social.children[0].style.display = "none";
            }
            // console.log(executive["lin"]);
            social.children[1].children[0].href = speaker["insta"];
            if (speaker["insta"] == "#") {
                social.children[1].style.display = "none";
            }
            // console.log(executive["insta"]);
            social.children[2].children[0].href = speaker["fb"];
            if (speaker["fb"] == "#") {
                social.children[2].style.display = "none";
            }
            // console.log(executive["fb"]);

            image[0].srcset = speaker["picture"];

            // speaker_info.classList.remove('pull-animation');
            // speaker_info.classList.add('drop-animation');
            speaker_info.style.display = "flex";
        } else if (type == "executives") {
            var executive = executives_data[j];
            executive_info.children[0].children[0]
            var text = executive_info.children[0].children[0].children;
            var image = executive_info.children[1].children;
            var social = executive_info.children[0].children[0].children[3];

            text[0].innerHTML = executive["name"];
            console.log(executive["name"]);
            text[1].innerHTML = executive["post"];
            // console.log(executive["post"]);
            text[2].innerText = executive["write_up"];
            // console.log(executive["write_up"]);

            social.children[0].children[0].href = executive["lin"];
            // console.log(executive["lin"]);
            social.children[1].children[0].href = executive["insta"];
            // console.log(executive["insta"]);
            social.children[2].children[0].href = executive["fb"];
            // console.log(executive["fb"]);

            image[0].srcset = executive["picture"];
            // console.log(executive["picture"]);

            if (j == 9 || j == 10) {
                executive_info.children[1].children[1].style.background = "radial-gradient(circle at 55%, rgba(0, 0, 0, 0), rgba(0, 0, 0, 1) 70%)";
            }

            // executive_info.classList.remove('pull-animation');
            // executive_info.classList.add('drop-animation');
            executive_info.style.display = "flex";
        } else if (type == "archives") {
            var archive = archives_data[j];
            var video = archive_info.children[0].children[0];

            // console.log(archive["link"]);
            window.open(archive["link"]);

            // archive_info.style.display = "block";
        } else if (type == "archives_2018") {
            var archive = archives_2018_data[j];
            var video = archive_info_2018.children[0].children[0];

            // console.log(archive["link"]);
            window.open(archive["link"]);

            // archive_info.style.display = "block";
        }
    }

    $("#close-btn-speakers").click(e => {
        var social = speaker_info.children[0].children[4];
        social.children[0].style.display = "block";
        social.children[1].style.display = "block";
        social.children[2].style.display = "block";
        // speaker_info.classList.add('pull-animation');
        // speaker_info.classList.remove('drop-animation');
        speaker_info.style.display = "none";
    });
    $("#close-btn-executives").click(e => {
        // if(j == 9 || j == 10){
        //     executive_info.children[1].children[1].style.background = "none";
        // }
        // executive_info.classList.add('pull-animation');
        // executive_info.classList.remove('drop-animation');
        executive_info.style.display = "none";
    });
    $("#archives-info").click(e => {
        archive_info.children[0].children[0].src = "";
        archive_info.style.display = "none";
    });
    $("#archives-info-2018").click(e => {
        archive_info_2018.children[0].children[0].src = "";
        archive_info_2018.style.display = "none";
    });
}