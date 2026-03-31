const translations = {
  no: {
    // Header
    "app.title": "CueFilm",
    "app.subtitle": "Finn filmer som passer humøret ditt",
    "header.myList": "★ Min filmliste",

    // Profile menu
    "profile.watchHistory": "📋 Se historikk",
    "profile.settings": "⚙️ Innstillinger",
    "profile.signIn": "Logg inn",
    "profile.logout": "🚪 Logg ut",

    // Random pick
    "random.button": "🎲 Tilfeldig utvalg",
    "random.loading": "⏳ Ruller...",
    "random.feelingLucky": "Feeling lucky?",

    // Mood selectors
    "mood.currentLabel": "Føler meg",
    "mood.desiredLabel": "Vil føle meg",
    "mood.selectCurrent": "Velg humør",
    "mood.selectDesired": "Velg følelse",

    // Current moods
    "mood.happy": "Glad",
    "mood.sad": "Trist",
    "mood.stressed": "Stresset",
    "mood.bored": "Kjeder meg",
    "mood.tired": "Sliten",
    "mood.anxious": "Urolig",
    "mood.energetic": "Energisk",
    "mood.scared": "Redd",

    // Desired moods
    "mood.uplifted": "Oppløftet",
    "mood.relaxed": "Avslappet",
    "mood.thrilled": "Spent",
    "mood.thoughtful": "Ettertenksom",
    "mood.amused": "Underholdt",
    "mood.inspired": "Inspirert",
    "mood.moved": "Berørt",
    "mood.desiredScared": "Skremt",
    "mood.tense": "På kanten",

    // Practical settings
    "settings.practical": "Praktisk",
    "settings.time": "Tilgjengelig tid",
    "settings.timeEpisode": "Episodelengde",
    "settings.period": "Periode",
    "settings.language": "Språk",
    "settings.country": "Produksjonsland",
    "settings.concentration": "Konsentrasjon",
    "settings.watchWith": "Ser med",
    "settings.mediaType": "Type innhold",
    "settings.mediaType.movie": "Film",
    "settings.mediaType.series": "Serie",
    "settings.mediaType.both": "Film & serie",
    "settings.searchLanguage": "Søk etter språk...",
    "settings.searchCountry": "Søk etter land...",
    "settings.allLanguages": "Alle språk",
    "settings.allCountries": "Alle land",
    "settings.notRelevant": "Ikke relevant",
    "settings.low": "Lav",
    "settings.medium": "Medium",
    "settings.high": "Høy",
    "settings.alone": "Alene",
    "settings.partner": "Partner",
    "settings.friends": "Venner",
    "settings.family": "Familie",

    // Submit buttons
    "submit.findMovies": "Finn filmer for meg",
    "submit.findSeries": "Finn serier for meg",
    "submit.findContent": "Finn innhold for meg",
    "submit.hiddenGem": "Finn en skjult perle",
    "submit.reset": "↺ Nullstill",

    // Results
    "results.recommendation": "Vår anbefaling for deg",
    "results.alternatives": "Andre gode valg",
    "results.showMore": "Vis {count} flere filmer",
    "results.hide": "Skjul",
    "results.back": "← Tilbake til søk",
    "results.random": "🎲 Tilfeldig utvalg",
    "results.hiddenGems": "💎 Skjulte perler",
    "results.title": "🎬 Resultater",
    "results.movieCount": "{count} filmer",
    "results.noMatch": "Fant ingen filmer som matcher. Prøv bredere kriterier.",
    "results.whyRecommended": "Hvorfor denne?",
    "results.aiAnalyzing": "Analyserer...",

    // Movie card
    "movie.save": "☆ lagre",
    "movie.saved": "★ lagret",
    "movie.watched": "✓ sett",
    "movie.notWatched": "○ sett?",
    "movie.readMore": "+ les mer",
    "movie.readLess": "− skjul",
    "movie.director": "Regi",
    "movie.actors": "Skuespillere",
    "movie.countryLabel": "Land",
    "movie.languageLabel": "Språk",
    "movie.votes": "stemmer",
    "movie.type.movie": "Film",
    "movie.type.series": "Serie",
    "movie.seasons": "{count} sesonger",
    "movie.season": "1 sesong",
    "movie.minPerEpisode": "min/ep",
    "movie.streaming": "Tilgjengelig på",

    // Library
    "library.savedTab": "★ Likte",
    "library.watchedTab": "✓ Sett",
    "library.emptySaved": "Du har ikke lagret noen filmer ennå",
    "library.emptyWatched": "Du har ikke markert noen filmer som sett",
    "library.hintSaved": 'Trykk "☆ lagre" på en film for å legge den til her',
    "library.hintWatched": 'Trykk "○ sett?" på en film for å markere den',

    // Settings
    "settingsModal.title": "Innstillinger",
    "settingsModal.profile": "👤 Profil",
    "settingsModal.appearance": "🎨 Utseende",
    "settingsModal.danger": "⚠️ Faresonen",
    "settingsModal.konto": "🔑 Konto",
    "settingsModal.uploadAvatar": "Last opp bilde",
    "settingsModal.useGoogleAvatar": "Bruk Google-bilde",
    "settingsModal.removeAvatar": "Fjern bilde",
    "settingsModal.username": "Brukernavn",
    "settingsModal.name": "Navn",
    "settingsModal.namePlaceholder": "Ditt navn",
    "settingsModal.email": "E-post",
    "settingsModal.emailPlaceholder": "din@epost.no",
    "settingsModal.age": "Alder",
    "settingsModal.gender": "Kjønn",
    "settingsModal.genderMale": "Mann",
    "settingsModal.genderFemale": "Kvinne",
    "settingsModal.genderOther": "Annet",
    "settingsModal.genderPreferNot": "Vil ikke si",
    "settingsModal.theme": "Tema",
    "settingsModal.themeDark": "Mørk",
    "settingsModal.themeLight": "Lys",
    "settingsModal.themeSystem": "System",
    "settingsModal.appLanguage": "Språk i appen",
    "settingsModal.deleteTitle": "Slett bruker",
    "settingsModal.deleteDesc":
      "Dette sletter all data permanent — profil, lagrede filmer og innstillinger. Handlingen kan ikke angres.",
    "settingsModal.deleteButton": "Slett min bruker",
    "settingsModal.deleteConfirm":
      "Er du sikker? All data blir slettet permanent.",
    "settingsModal.deleteYes": "Ja, slett alt",
    "settingsModal.deleteCancel": "Avbryt",
    "settingsModal.save": "Lagre",
    "settingsModal.avatarClickTitle": "Klikk for å endre bilde",
    "settingsModal.avatarChange": "Endre",
    "settingsModal.logoutTitle": "Logg ut",
    "settingsModal.logoutDesc": "Du kan logge inn igjen når som helst.",
    "settingsModal.logoutConfirm": "Er du sikker på at du vil logge ut?",
    "settingsModal.logoutYes": "Ja, logg ut",
    "settingsModal.deleteWarning":
      "⚠️ Dette kan ikke angres. All data slettes permanent.",
    "settingsModal.deleteTypeConfirm": "Skriv {word} for å bekrefte:",
    "settingsModal.deleteTypeWord": "slett",

    // Auth
    "auth.signUp": "Lag bruker",
    "auth.signInSlash": "/ Logg inn",

    // Share
    "share.button": "Del",
    "share.text": "Sjekk ut {title} ({year}) — anbefalt av CueFilm!",

    // Movie actions
    "movie.goForIt": "Denne ser jeg!",
    "movie.chosen": "✓ Valgt",
    "movie.dislike": "Ikke for meg",
    "movie.disliked": "✗ Skjult",

    // Personal suggestion
    "suggest.button": "Foreslå for meg",
    "suggest.tooltip": "Basert på filmene du har likt, sett og valgt — og ekskluderer det du ikke likte.",
    "suggest.loading": "Tenker...",

    // AI feedback
    "ai.helpful": "Nyttig",
    "ai.notHelpful": "Ikke nyttig",
    "ai.thanks": "Takk for tilbakemeldingen!",

    // Errors
    "error.noResults": "Fant ingen filmer som matcher. Prøv bredere kriterier.",
    "error.noHiddenGems": "Fant ingen skjulte perler. Prøv bredere kriterier.",
    "error.fetchFailed": "Kunne ikke hente filmer. Prøv igjen.",
    "error.randomFailed": "Kunne ikke hente tilfeldig utvalg. Prøv igjen.",

    // Loader
    "loader.scanning": "Skanner filmuniverset",
    "loader.analyzing": "Analyserer humøret ditt",
    "loader.matching": "Matcher stemningen",
    "loader.finetuning": "Finjusterer anbefalinger",
    "loader.calculating": "Beregner kompatibilitet",

    // Languages
    "lang.english": "Engelsk",
    "lang.norwegian": "Norsk",
    "lang.swedish": "Svensk",
    "lang.danish": "Dansk",
    "lang.finnish": "Finsk",
    "lang.french": "Fransk",
    "lang.spanish": "Spansk",
    "lang.portuguese": "Portugisisk",
    "lang.german": "Tysk",
    "lang.dutch": "Nederlandsk",
    "lang.italian": "Italiensk",
    "lang.russian": "Russisk",
    "lang.ukrainian": "Ukrainsk",
    "lang.polish": "Polsk",
    "lang.czech": "Tsjekkisk",
    "lang.hungarian": "Ungarsk",
    "lang.romanian": "Rumensk",
    "lang.greek": "Gresk",
    "lang.turkish": "Tyrkisk",
    "lang.arabic": "Arabisk",
    "lang.persian": "Persisk",
    "lang.hebrew": "Hebraisk",
    "lang.hindi": "Hindi",
    "lang.korean": "Koreansk",
    "lang.japanese": "Japansk",
    "lang.chinese": "Kinesisk",
    "lang.thai": "Thai",
    "lang.vietnamese": "Vietnamesisk",
    "lang.indonesian": "Indonesisk",
    "lang.malay": "Malayisk",

    // Countries
    "country.usa": "USA",
    "country.uk": "Storbritannia",
    "country.canada": "Canada",
    "country.australia": "Australia",
    "country.newzealand": "New Zealand",
    "country.ireland": "Irland",
    "country.norway": "Norge",
    "country.sweden": "Sverige",
    "country.denmark": "Danmark",
    "country.finland": "Finland",
    "country.france": "Frankrike",
    "country.spain": "Spania",
    "country.portugal": "Portugal",
    "country.germany": "Tyskland",
    "country.austria": "Østerrike",
    "country.switzerland": "Sveits",
    "country.netherlands": "Nederland",
    "country.belgium": "Belgia",
    "country.italy": "Italia",
    "country.russia": "Russland",
    "country.poland": "Polen",
    "country.czech": "Tsjekkia",
    "country.hungary": "Ungarn",
    "country.romania": "Romania",
    "country.greece": "Hellas",
    "country.turkey": "Tyrkia",
    "country.israel": "Israel",
    "country.iran": "Iran",
    "country.egypt": "Egypt",
    "country.nigeria": "Nigeria",
    "country.southafrica": "Sør-Afrika",
    "country.india": "India",
    "country.southkorea": "Sør-Korea",
    "country.japan": "Japan",
    "country.china": "Kina",
    "country.thailand": "Thailand",
    "country.indonesia": "Indonesia",
    "country.brazil": "Brasil",
    "country.mexico": "Mexico",
    "country.argentina": "Argentina",
    "country.colombia": "Colombia",
  },

  // Explanations - Journey intros
  "explanation.journey.generic":
    "Du er {from} og vil føle deg {to} — denne filmen kan ta deg dit.",
  "explanation.journey.stressed_relaxed":
    "Når du er stresset, trenger du noe som lar deg puste ut.",
  "explanation.journey.tired_relaxed":
    "Når du er sliten, trenger du noe rolig og behagelig.",
  "explanation.journey.anxious_relaxed":
    "Når du er urolig, trenger du noe trygt og beroligende.",
  "explanation.journey.bored_thrilled":
    "Når du kjeder deg, trenger du noe som virkelig griper tak i deg.",
  "explanation.journey.tired_thrilled":
    "Selv om du er sliten, kan riktig film gi deg et adrenalinkick.",
  "explanation.journey.sad_uplifted":
    "Når du er trist, kan riktig film løfte deg opp igjen.",
  "explanation.journey.sad_moved":
    "Noen ganger når du er trist, trenger du en film som forstår det.",
  "explanation.journey.happy_moved":
    "Når du er glad, har du overskudd til å la deg berøre.",
  "explanation.journey.happy_scared":
    "Når du er glad, er du klar for å la deg skremme.",
  "explanation.journey.energetic_thrilled":
    "Med all den energien trenger du noe som matcher.",
  "explanation.journey.happy_thrilled":
    "Når du er glad og vil ha spenning, er du klar for full action.",
  "explanation.journey.sad_amused":
    "Når du er trist, kan latter være den beste medisinen.",
  "explanation.journey.anxious_amused":
    "Når du er urolig, kan en god komedie lette på trykket.",
  "explanation.journey.stressed_uplifted":
    "Når du er stresset, trenger du noe som gir deg håp.",
  "explanation.journey.bored_scared":
    "Når du kjeder deg, kan en skikkelig skrekk vekke deg til live.",
  "explanation.journey.scared_relaxed":
    "Når du er redd, trenger du noe trygt og beroligende.",
  "explanation.journey.scared_amused":
    "Når du er redd, kan latter ta bort spenningen.",
  "explanation.journey.scared_scared":
    "Du vil ha mer av adrenalinet — la oss finne noe skummelt.",
  "explanation.journey.happy_amused":
    "Du er allerede glad — la oss holde det gående med noe morsomt.",
  "explanation.journey.tired_amused":
    "Når du er sliten, trenger du noe lett og morsomt.",
  "explanation.journey.bored_amused":
    "Når du kjeder deg, trenger du noe som får deg til å le.",
  "explanation.journey.energetic_scared":
    "Du har energi til å tåle skrekken — la oss gi deg frysninger.",
  "explanation.journey.happy_thoughtful":
    "Når du er glad, har du overskudd til å tenke dypt.",
  "explanation.journey.happy_inspired":
    "Du er i godt humør — perfekt for noe som inspirerer.",
  "explanation.journey.tired_uplifted":
    "Selv om du er sliten, kan riktig film gi deg ny energi.",
  "explanation.journey.anxious_uplifted":
    "Når du er urolig, trenger du noe som minner deg på det gode.",

  // Explanations - Genre reasons
  "explanation.genre.comedy": "{genre} gir akkurat den lette tonen du trenger.",
  "explanation.genre.thriller": "{genre} er perfekt for å bygge spenning.",
  "explanation.genre.horror":
    "{genre} leverer akkurat den skrekken du er ute etter.",
  "explanation.genre.drama": "{genre} gir rom for de dype følelsene.",
  "explanation.genre.romance": "{genre} gir varme og nærhet.",
  "explanation.genre.animation":
    "{genre} er perfekt for å koble av uten å tenke for mye.",
  "explanation.genre.action":
    "{genre} gir deg farten og spenningen du er ute etter.",
  "explanation.genre.generic":
    "{genre} passer godt til stemningen du er ute etter.",

  // Explanations - Energy reasons
  "explanation.energy.calm":
    "Filmen har et rolig tempo som lar deg lene deg tilbake.",
  "explanation.energy.intense":
    "Den har høy intensitet og holder deg engasjert hele veien.",
  "explanation.energy.feelgood":
    "Den har en varm og optimistisk tone som smitter.",
  "explanation.energy.emotional":
    "Den er emosjonelt sterk og gir deg noe å kjenne på.",
  "explanation.energy.slowBurn":
    "Spenningen bygges sakte — du trenger ikke mye energi for å henge med.",

  // Explanations - Social reasons
  "explanation.social.alone": "Perfekt for en kveld for deg selv.",
  "explanation.social.partner": "En fin film å se sammen med noen.",
  "explanation.social.friends": "Funker godt i godt selskap.",
  "explanation.social.family": "Trygt valg for hele familien.",
  "explanation.social.aloneThrilller":
    "Thriller alene gir den mest intense opplevelsen.",
  "explanation.social.partnerRomance":
    "Romantikk er alltid bedre å dele med noen.",
  "explanation.social.friendsComedy":
    "Komedie er alltid bedre med latter i rommet.",
  "explanation.social.friendsHorror":
    "Horror med venner — skummelt og morsomt samtidig.",
  "explanation.social.familySafe": "Trygt og underholdende for hele familien.",

  // Explanations - Time
  "explanation.timeFit":
    "Med sine {runtime} minutter passer den perfekt innenfor tiden du har.",

  en: {
    "app.title": "CueFilm",
    "app.subtitle": "Find movies that match your mood",
    "header.myList": "★ My list",

    "profile.watchHistory": "📋 Watch history",
    "profile.settings": "⚙️ Settings",
    "profile.signIn": "Sign in",
    "profile.logout": "🚪 Log out",

    "random.button": "🎲 Random picks",
    "random.loading": "⏳ Rolling...",
    "random.feelingLucky": "Feeling lucky?",

    "mood.currentLabel": "I feel",
    "mood.desiredLabel": "I want to feel",
    "mood.selectCurrent": "Select mood",
    "mood.selectDesired": "Select feeling",

    "mood.happy": "Happy",
    "mood.sad": "Sad",
    "mood.stressed": "Stressed",
    "mood.bored": "Bored",
    "mood.tired": "Tired",
    "mood.anxious": "Anxious",
    "mood.energetic": "Energetic",
    "mood.scared": "Scared",

    "mood.uplifted": "Uplifted",
    "mood.relaxed": "Relaxed",
    "mood.thrilled": "Thrilled",
    "mood.thoughtful": "Thoughtful",
    "mood.amused": "Amused",
    "mood.inspired": "Inspired",
    "mood.moved": "Moved",
    "mood.desiredScared": "Scared",
    "mood.tense": "On edge",

    "settings.practical": "Practical",
    "settings.time": "Available time",
    "settings.timeEpisode": "Episode length",
    "settings.period": "Period",
    "settings.language": "Language",
    "settings.country": "Country of origin",
    "settings.concentration": "Concentration",
    "settings.watchWith": "Watching with",
    "settings.mediaType": "Content type",
    "settings.mediaType.movie": "Movie",
    "settings.mediaType.series": "Series",
    "settings.mediaType.both": "Movie & series",
    "settings.searchLanguage": "Search language...",
    "settings.searchCountry": "Search country...",
    "settings.allLanguages": "All languages",
    "settings.allCountries": "All countries",
    "settings.notRelevant": "Not relevant",
    "settings.low": "Low",
    "settings.medium": "Medium",
    "settings.high": "High",
    "settings.alone": "Alone",
    "settings.partner": "Partner",
    "settings.friends": "Friends",
    "settings.family": "Family",

    "submit.findMovies": "Find movies for me",
    "submit.findSeries": "Find series for me",
    "submit.findContent": "Find content for me",
    "submit.hiddenGem": "Find a hidden gem",
    "submit.reset": "↺ Reset",

    "results.recommendation": "Our recommendation for you",
    "results.alternatives": "Other great picks",
    "results.showMore": "Show {count} more movies",
    "results.hide": "Hide",
    "results.back": "← Back to search",
    "results.random": "🎲 Random picks",
    "results.hiddenGems": "💎 Hidden gems",
    "results.title": "🎬 Results",
    "results.movieCount": "{count} movies",
    "results.noMatch": "No matching movies found. Try broader criteria.",
    "results.whyRecommended": "Why this one?",
    "results.aiAnalyzing": "Analyzing...",

    "movie.save": "☆ save",
    "movie.saved": "★ saved",
    "movie.watched": "✓ watched",
    "movie.notWatched": "○ watched?",
    "movie.readMore": "+ read more",
    "movie.readLess": "− hide",
    "movie.director": "Director",
    "movie.actors": "Cast",
    "movie.countryLabel": "Country",
    "movie.languageLabel": "Language",
    "movie.votes": "votes",
    "movie.type.movie": "Movie",
    "movie.type.series": "Series",
    "movie.seasons": "{count} seasons",
    "movie.season": "1 season",
    "movie.minPerEpisode": "min/ep",
    "movie.streaming": "Available on",

    "library.savedTab": "★ Liked",
    "library.watchedTab": "✓ Watched",
    "library.emptySaved": "You haven't saved any movies yet",
    "library.emptyWatched": "You haven't marked any movies as watched",
    "library.hintSaved": 'Press "☆ save" on a movie to add it here',
    "library.hintWatched": 'Press "○ watched?" on a movie to mark it',

    "settingsModal.title": "Settings",
    "settingsModal.profile": "👤 Profile",
    "settingsModal.appearance": "🎨 Appearance",
    "settingsModal.danger": "⚠️ Danger zone",
    "settingsModal.konto": "🔑 Account",
    "settingsModal.uploadAvatar": "Upload photo",
    "settingsModal.useGoogleAvatar": "Use Google picture",
    "settingsModal.removeAvatar": "Remove photo",
    "settingsModal.username": "Username",
    "settingsModal.name": "Name",
    "settingsModal.namePlaceholder": "Your name",
    "settingsModal.email": "Email",
    "settingsModal.emailPlaceholder": "your@email.com",
    "settingsModal.age": "Age",
    "settingsModal.gender": "Gender",
    "settingsModal.genderMale": "Male",
    "settingsModal.genderFemale": "Female",
    "settingsModal.genderOther": "Other",
    "settingsModal.genderPreferNot": "Prefer not to say",
    "settingsModal.theme": "Theme",
    "settingsModal.themeDark": "Dark",
    "settingsModal.themeLight": "Light",
    "settingsModal.themeSystem": "System",
    "settingsModal.appLanguage": "App language",
    "settingsModal.deleteTitle": "Delete account",
    "settingsModal.deleteDesc":
      "This permanently deletes all data — profile, saved movies, and settings. This action cannot be undone.",
    "settingsModal.deleteButton": "Delete my account",
    "settingsModal.deleteConfirm":
      "Are you sure? All data will be permanently deleted.",
    "settingsModal.deleteYes": "Yes, delete everything",
    "settingsModal.deleteCancel": "Cancel",
    "settingsModal.save": "Save",
    "settingsModal.avatarClickTitle": "Click to change photo",
    "settingsModal.avatarChange": "Change",
    "settingsModal.logoutTitle": "Log out",
    "settingsModal.logoutDesc": "You can log back in anytime.",
    "settingsModal.logoutConfirm": "Are you sure you want to log out?",
    "settingsModal.logoutYes": "Yes, log out",
    "settingsModal.deleteWarning":
      "⚠️ This cannot be undone. All data will be permanently deleted.",
    "settingsModal.deleteTypeConfirm": "Type {word} to confirm:",
    "settingsModal.deleteTypeWord": "delete",

    "auth.signUp": "Sign up",
    "auth.signInSlash": "/ Sign in",

    "share.button": "Share",
    "share.text": "Check out {title} ({year}) — recommended by CueFilm!",

    "movie.goForIt": "I'll watch this!",
    "movie.chosen": "✓ Chosen",
    "movie.dislike": "Not for me",
    "movie.disliked": "✗ Hidden",

    "suggest.button": "Suggest for me",
    "suggest.tooltip": "Based on movies you've liked, watched and chosen — excluding ones you didn't like.",
    "suggest.loading": "Thinking...",

    "ai.helpful": "Helpful",
    "ai.notHelpful": "Not helpful",
    "ai.thanks": "Thanks for your feedback!",

    "error.noResults": "No matching movies found. Try broader criteria.",
    "error.noHiddenGems": "No hidden gems found. Try broader criteria.",
    "error.fetchFailed": "Could not fetch movies. Try again.",
    "error.randomFailed": "Could not fetch random picks. Try again.",

    "loader.scanning": "Scanning the movie universe",
    "loader.analyzing": "Analyzing your mood",
    "loader.matching": "Matching the vibe",
    "loader.finetuning": "Fine-tuning recommendations",
    "loader.calculating": "Calculating compatibility",

    "lang.english": "English",
    "lang.norwegian": "Norwegian",
    "lang.swedish": "Swedish",
    "lang.danish": "Danish",
    "lang.finnish": "Finnish",
    "lang.french": "French",
    "lang.spanish": "Spanish",
    "lang.portuguese": "Portuguese",
    "lang.german": "German",
    "lang.dutch": "Dutch",
    "lang.italian": "Italian",
    "lang.russian": "Russian",
    "lang.ukrainian": "Ukrainian",
    "lang.polish": "Polish",
    "lang.czech": "Czech",
    "lang.hungarian": "Hungarian",
    "lang.romanian": "Romanian",
    "lang.greek": "Greek",
    "lang.turkish": "Turkish",
    "lang.arabic": "Arabic",
    "lang.persian": "Persian",
    "lang.hebrew": "Hebrew",
    "lang.hindi": "Hindi",
    "lang.korean": "Korean",
    "lang.japanese": "Japanese",
    "lang.chinese": "Chinese",
    "lang.thai": "Thai",
    "lang.vietnamese": "Vietnamese",
    "lang.indonesian": "Indonesian",
    "lang.malay": "Malay",

    "country.usa": "USA",
    "country.uk": "United Kingdom",
    "country.canada": "Canada",
    "country.australia": "Australia",
    "country.newzealand": "New Zealand",
    "country.ireland": "Ireland",
    "country.norway": "Norway",
    "country.sweden": "Sweden",
    "country.denmark": "Denmark",
    "country.finland": "Finland",
    "country.france": "France",
    "country.spain": "Spain",
    "country.portugal": "Portugal",
    "country.germany": "Germany",
    "country.austria": "Austria",
    "country.switzerland": "Switzerland",
    "country.netherlands": "Netherlands",
    "country.belgium": "Belgium",
    "country.italy": "Italy",
    "country.russia": "Russia",
    "country.poland": "Poland",
    "country.czech": "Czechia",
    "country.hungary": "Hungary",
    "country.romania": "Romania",
    "country.greece": "Greece",
    "country.turkey": "Turkey",
    "country.israel": "Israel",
    "country.iran": "Iran",
    "country.egypt": "Egypt",
    "country.nigeria": "Nigeria",
    "country.southafrica": "South Africa",
    "country.india": "India",
    "country.southkorea": "South Korea",
    "country.japan": "Japan",
    "country.china": "China",
    "country.thailand": "Thailand",
    "country.indonesia": "Indonesia",
    "country.brazil": "Brazil",
    "country.mexico": "Mexico",
    "country.argentina": "Argentina",
    "country.colombia": "Colombia",

    // Explanations - Journey intros
    "explanation.journey.generic":
      "You're feeling {from} and want to feel {to} — this movie can take you there.",
    "explanation.journey.stressed_relaxed":
      "When you're stressed, you need something that lets you breathe.",
    "explanation.journey.tired_relaxed":
      "When you're tired, you need something calm and comfortable.",
    "explanation.journey.anxious_relaxed":
      "When you're anxious, you need something safe and soothing.",
    "explanation.journey.bored_thrilled":
      "When you're bored, you need something that really grabs you.",
    "explanation.journey.tired_thrilled":
      "Even when you're tired, the right movie can give you an adrenaline kick.",
    "explanation.journey.sad_uplifted":
      "When you're sad, the right movie can lift you back up.",
    "explanation.journey.sad_moved":
      "Sometimes when you're sad, you need a movie that understands.",
    "explanation.journey.happy_moved":
      "When you're happy, you have the energy to let yourself be moved.",
    "explanation.journey.happy_scared":
      "When you're happy, you're ready to be scared.",
    "explanation.journey.energetic_thrilled":
      "With all that energy, you need something that matches it.",
    "explanation.journey.happy_thrilled":
      "You're happy and want thrills — you're ready for full action.",
    "explanation.journey.sad_amused":
      "When you're sad, laughter can be the best medicine.",
    "explanation.journey.anxious_amused":
      "When you're anxious, a good comedy can ease the pressure.",
    "explanation.journey.stressed_uplifted":
      "When you're stressed, you need something that gives you hope.",
    "explanation.journey.bored_scared":
      "When you're bored, a proper scare can wake you up.",
    "explanation.journey.scared_relaxed":
      "When you're scared, you need something safe and comforting.",
    "explanation.journey.scared_amused":
      "When you're scared, laughter can take the edge off.",
    "explanation.journey.scared_scared":
      "You want more adrenaline — let's find something scary.",
    "explanation.journey.happy_amused":
      "You're already happy — let's keep it going with something funny.",
    "explanation.journey.tired_amused":
      "When you're tired, you need something light and fun.",
    "explanation.journey.bored_amused":
      "When you're bored, you need something that makes you laugh.",
    "explanation.journey.energetic_scared":
      "You have the energy to handle the scares — let's give you chills.",
    "explanation.journey.happy_thoughtful":
      "When you're happy, you have the headspace to think deep.",
    "explanation.journey.happy_inspired":
      "You're in a good mood — perfect for something inspiring.",
    "explanation.journey.tired_uplifted":
      "Even when you're tired, the right movie can recharge you.",
    "explanation.journey.anxious_uplifted":
      "When you're anxious, you need something that reminds you of the good.",

    // Explanations - Genre reasons
    "explanation.genre.comedy":
      "{genre} gives exactly the light tone you need.",
    "explanation.genre.thriller": "{genre} is perfect for building suspense.",
    "explanation.genre.horror":
      "{genre} delivers exactly the scares you're looking for.",
    "explanation.genre.drama": "{genre} gives space for deep emotions.",
    "explanation.genre.romance": "{genre} brings warmth and closeness.",
    "explanation.genre.animation":
      "{genre} is perfect for unwinding without thinking too much.",
    "explanation.genre.action":
      "{genre} gives you the speed and excitement you're after.",
    "explanation.genre.generic":
      "{genre} fits well with the mood you're going for.",

    // Explanations - Energy reasons
    "explanation.energy.calm":
      "The movie has a calm pace that lets you lean back.",
    "explanation.energy.intense":
      "It has high intensity and keeps you engaged throughout.",
    "explanation.energy.feelgood":
      "It has a warm and optimistic tone that's infectious.",
    "explanation.energy.emotional":
      "It's emotionally powerful and gives you something to feel.",
    "explanation.energy.slowBurn":
      "The tension builds slowly — you don't need much energy to keep up.",

    // Explanations - Social reasons
    "explanation.social.alone": "Perfect for an evening to yourself.",
    "explanation.social.partner":
      "A great movie to watch with someone special.",
    "explanation.social.friends": "Works great in good company.",
    "explanation.social.family": "A safe pick for the whole family.",
    "explanation.social.aloneThrilller":
      "Thriller alone gives the most intense experience.",
    "explanation.social.partnerRomance":
      "Romance is always better when shared.",
    "explanation.social.friendsComedy":
      "Comedy is always better with laughter in the room.",
    "explanation.social.friendsHorror":
      "Horror with friends — scary and fun at the same time.",
    "explanation.social.familySafe":
      "Safe and entertaining for the whole family.",

    // Explanations - Time
    "explanation.timeFit":
      "At {runtime} minutes, it fits perfectly within your available time.",
  },
};

export default translations;
