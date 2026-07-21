/**
 * このアプリの紹介ツアー用データ。5ページ、各ページ「メイン1件 + その他2件」。
 * title / description / icon / assetPath はここに複製しない。正本は catalog.json。
 * id から findCatalogItem() で引く。
 */

export interface IntroApiEntry {
  /** catalog.json の id。title・description・icon は findCatalogItem() 経由で引く */
  id: string
  javaMethodNames: readonly string[]
  javaCode: string
}

export interface IntroPage {
  page: number
  main: IntroApiEntry
  others: readonly [IntroApiEntry, IntroApiEntry]
}

const translateMyMemoryCode = String.raw`
    /** templates/fun/Jikan.html, joke.html, ohuzake.html, OpenTrivia.html, Useless.html, Yugio.html から利用。MyMemory翻訳を中継する。 */
    @GetMapping(value = "/api/webapi/tool/translateMyMemory", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> translateMyMemory(@RequestParam("text") String text) {
        try {
            return ResponseEntity.ok(ToolApi.translateMyMemory(text));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body("{\"error\":\"外部APIの呼び出しに失敗しました\"}");
        }
    }
`

const sindan: IntroApiEntry = {
  id: "sindan",
  javaMethodNames: ["getSindanQuestions"],
  javaCode: String.raw`
    /** templates/fun/sindan.html から利用。診断用の設問セットを中継する。 */
    @GetMapping(value = "/api/webapi/entertainment/getSindanQuestions", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getSindanQuestions(@RequestParam("level") String level) {
        try {
            return ResponseEntity.ok(EntertainmentApi.getSindanQuestions(level));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body("{\"error\":\"外部APIの呼び出しに失敗しました\"}");
        }
    }
`,
}

const zyouku: IntroApiEntry = {
  id: "zyouku",
  javaMethodNames: ["getOfficialJokeRandom"],
  javaCode: String.raw`
    /** templates/fun/joke.html から利用。ランダムなジョークを中継する。 */
    @GetMapping(value = "/api/webapi/entertainment/getOfficialJokeRandom", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getOfficialJokeRandom() {
        try {
            return ResponseEntity.ok(EntertainmentApi.getOfficialJokeRandom());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body("{\"error\":\"外部APIの呼び出しに失敗しました\"}");
        }
    }
`,
}

const anime: IntroApiEntry = {
  id: "anime",
  javaMethodNames: ["getJikanAnimeSearch", "getJikanTopAnime"],
  javaCode: String.raw`
    /** templates/data/anime.html から利用。キーワードでのアニメ検索結果を中継する。 */
    @GetMapping(value = "/api/webapi/entertainment/getJikanAnimeSearch", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getJikanAnimeSearch(@RequestParam("keyword") String keyword) {
        try {
            return ResponseEntity.ok(EntertainmentApi.getJikanAnimeSearch(keyword));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body("{\"error\":\"外部APIの呼び出しに失敗しました\"}");
        }
    }

    /** templates/data/anime.html から利用。人気アニメ一覧を中継する。 */
    @GetMapping(value = "/api/webapi/entertainment/getJikanTopAnime", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getJikanTopAnime() {
        try {
            return ResponseEntity.ok(EntertainmentApi.getJikanTopAnime());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body("{\"error\":\"外部APIの呼び出しに失敗しました\"}");
        }
    }
`,
}

const kabu: IntroApiEntry = {
  id: "kabu",
  javaMethodNames: ["getAlphaVantageGlobalQuote"],
  javaCode: String.raw`
    /** templates/data/kabu.html から利用。Alpha Vantageの株価を中継する（APIキーはサーバー側で保持）。 */
    @GetMapping(value = "/api/webapi/finance/getAlphaVantageGlobalQuote", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getAlphaVantageGlobalQuote(@RequestParam("symbol") String symbol) {
        try {
            return ResponseEntity.ok(FinanceApi.getAlphaVantageGlobalQuote(symbol));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body("{\"error\":\"外部APIの呼び出しに失敗しました\"}");
        }
    }
`,
}

const weather: IntroApiEntry = {
  id: "weather",
  javaMethodNames: ["getJmaForecast"],
  javaCode: String.raw`
    /**
     * templates/data/weather.html から利用。気象庁の地域コード別天気予報を中継する。
     * 元のAPIレスポンス（JSON配列）をそのまま返す。
     */
    @GetMapping(value = "/api/webapi/weather/getJmaForecast", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getJmaForecast(@RequestParam("prefCode") String prefCode) {
        try {
            String result = WeatherApi.getJmaForecast(prefCode);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body("{\"error\":\"外部APIの呼び出しに失敗しました\"}");
        }
    }
`,
}

const countrysearch: IntroApiEntry = {
  id: "countrysearch",
  javaMethodNames: ["getCountriesCapital", "getCountriesPopulation"],
  javaCode: String.raw`
    /** templates/data/countrySearch.html から利用。国別人口データ一覧を中継する。 */
    @GetMapping(value = "/api/webapi/geo/getCountriesPopulation", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getCountriesPopulation() {
        try {
            return ResponseEntity.ok(GeoApi.getCountriesPopulation());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body("{\"error\":\"外部APIの呼び出しに失敗しました\"}");
        }
    }

    /** templates/data/countrySearch.html から利用。国別首都一覧を中継する。 */
    @GetMapping(value = "/api/webapi/geo/getCountriesCapital", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getCountriesCapital() {
        try {
            return ResponseEntity.ok(GeoApi.getCountriesCapital());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body("{\"error\":\"外部APIの呼び出しに失敗しました\"}");
        }
    }
`,
}

const useless: IntroApiEntry = {
  id: "useless",
  javaMethodNames: ["getUselessFactRandom", "translateMyMemory"],
  javaCode: String.raw`
    /** templates/fun/ohuzake.html, templates/fun/Useless.html, templates/other/itiran2.html から利用。雑学を中継する。 */
    @GetMapping(value = "/api/webapi/entertainment/getUselessFactRandom", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getUselessFactRandom(@RequestParam(value = "language", required = false) String language) {
        try {
            return ResponseEntity.ok(EntertainmentApi.getUselessFactRandom(language));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body("{\"error\":\"外部APIの呼び出しに失敗しました\"}");
        }
    }
` + translateMyMemoryCode,
}

const cars: IntroApiEntry = {
  id: "cars",
  javaMethodNames: [
    "getNhtsaModelsForMake",
    "getWikipediaSummary",
    "translateArgos",
  ],
  javaCode: String.raw`
    /** templates/data/Cars.html から利用。NHTSA vPICのメーカー別車種一覧を中継する。 */
    @GetMapping(value = "/api/webapi/data/getNhtsaModelsForMake", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getNhtsaModelsForMake(@RequestParam("make") String make) {
        try {
            return ResponseEntity.ok(DataApi.getNhtsaModelsForMake(make));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body("{\"error\":\"外部APIの呼び出しに失敗しました\"}");
        }
    }

    /** templates/data/Cars.html から利用。英語版Wikipediaのページ要約を中継する。 */
    @GetMapping(value = "/api/webapi/data/getWikipediaSummary", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getWikipediaSummary(@RequestParam("title") String title) {
        try {
            return ResponseEntity.ok(DataApi.getWikipediaSummary(title));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body("{\"error\":\"外部APIの呼び出しに失敗しました\"}");
        }
    }

    /** templates/data/Cars.html から利用。Argos Open Tech Translateを中継する。 */
    @GetMapping(value = "/api/webapi/tool/translateArgos", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> translateArgos(@RequestParam("text") String text) {
        try {
            return ResponseEntity.ok(ToolApi.translateArgos(text));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body("{\"error\":\"外部APIの呼び出しに失敗しました\"}");
        }
    }
`,
}

const waifu: IntroApiEntry = {
  id: "waifu",
  javaMethodNames: ["getWaifuImages"],
  javaCode: String.raw`
    /** templates/image/Waifu.html から利用。タグ指定でWaifu画像を中継する。 */
    @GetMapping(value = "/api/webapi/image/getWaifuImages", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getWaifuImages(@RequestParam(value = "tag", required = false) String tag) {
        try {
            return ResponseEntity.ok(ImageApi.getWaifuImages(tag));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body("{\"error\":\"外部APIの呼び出しに失敗しました\"}");
        }
    }
`,
}

const yesno: IntroApiEntry = {
  id: "yesno",
  javaMethodNames: ["getYesNo"],
  javaCode: String.raw`
    /** templates/fun/YesNo.html から利用。Yes/No回答を中継する。 */
    @GetMapping(value = "/api/webapi/entertainment/getYesNo", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getYesNo() {
        try {
            return ResponseEntity.ok(EntertainmentApi.getYesNo());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body("{\"error\":\"外部APIの呼び出しに失敗しました\"}");
        }
    }
`,
}

const threeD: IntroApiEntry = {
  id: "3d",
  javaMethodNames: ["getGltfSampleModel"],
  javaCode: String.raw`
    /** templates/image/3D.html から利用。glTFサンプルモデルのバイナリを中継する。 */
    @GetMapping(value = "/api/webapi/image/getGltfSampleModel", produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    public ResponseEntity<byte[]> getGltfSampleModel(@RequestParam("modelName") String modelName) {
        try {
            return ResponseEntity.ok(ImageApi.getGltfSampleModel(modelName));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(null);
        }
    }
`,
}

const utyu: IntroApiEntry = {
  id: "utyu",
  javaMethodNames: ["getNasaNeoWsFeed"],
  javaCode: String.raw`
    /** templates/data/utyu.html から利用。NASA NeoWsの地球近傍天体フィードを中継する。 */
    @GetMapping(value = "/api/webapi/data/getNasaNeoWsFeed", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getNasaNeoWsFeed(@RequestParam("startDate") String startDate,
            @RequestParam("endDate") String endDate,
            @RequestParam(value = "apiKey", required = false) String apiKey) {
        try {
            return ResponseEntity.ok(DataApi.getNasaNeoWsFeed(startDate, endDate, apiKey));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body("{\"error\":\"外部APIの呼び出しに失敗しました\"}");
        }
    }
`,
}

const applemusic: IntroApiEntry = {
  id: "applemusic",
  javaMethodNames: ["getItunesSearch"],
  javaCode: String.raw`
    /** templates/data/applemusic.html から利用。iTunes Search APIの楽曲検索結果を中継する。 */
    @GetMapping(value = "/api/webapi/entertainment/getItunesSearch", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getItunesSearch(@RequestParam("keyword") String keyword) {
        try {
            return ResponseEntity.ok(EntertainmentApi.getItunesSearch(keyword));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body("{\"error\":\"外部APIの呼び出しに失敗しました\"}");
        }
    }
`,
}

const joke: IntroApiEntry = {
  id: "joke",
  javaMethodNames: ["getOfficialJokeRandomJoke", "translateMyMemory"],
  javaCode: String.raw`
    /** templates/fun/zyouku.html から利用。ランダムなジョークを中継する（別エンドポイント）。 */
    @GetMapping(value = "/api/webapi/entertainment/getOfficialJokeRandomJoke", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getOfficialJokeRandomJoke() {
        try {
            return ResponseEntity.ok(EntertainmentApi.getOfficialJokeRandomJoke());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body("{\"error\":\"外部APIの呼び出しに失敗しました\"}");
        }
    }
` + translateMyMemoryCode,
}

const opentrivia: IntroApiEntry = {
  id: "opentrivia",
  javaMethodNames: ["getOpenTriviaQuestion", "translateMyMemory"],
  javaCode: String.raw`
    /** templates/fun/OpenTrivia.html から利用。クイズ問題を中継する。 */
    @GetMapping(value = "/api/webapi/entertainment/getOpenTriviaQuestion", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getOpenTriviaQuestion(@RequestParam("category") String category) {
        try {
            return ResponseEntity.ok(EntertainmentApi.getOpenTriviaQuestion(category));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body("{\"error\":\"外部APIの呼び出しに失敗しました\"}");
        }
    }
` + translateMyMemoryCode,
}

export const introPages: readonly IntroPage[] = [
  { page: 1, main: sindan, others: [zyouku, anime] },
  { page: 2, main: kabu, others: [weather, countrysearch] },
  { page: 3, main: useless, others: [cars, waifu] },
  { page: 4, main: yesno, others: [threeD, utyu] },
  { page: 5, main: applemusic, others: [joke, opentrivia] },
]
