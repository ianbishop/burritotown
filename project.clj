(defproject yalp "0.1.0-SNAPSHOT"
  :description "FIXME: write description"
  :url "http://example.com/FIXME"
  :profiles {:uberjar {:aot :all}}
  :license {:name "Eclipse Public License"
            :url "http://www.eclipse.org/legal/epl-v10.html"}
  :dependencies [[org.clojure/clojure "1.6.0"]
                 [org.clojure/core.cache "0.6.4"]
                 [org.clojure/tools.logging "0.3.1"]
                 [org.clojure/data.csv "0.1.2"]
                 [ring "1.3.2"]
                 [ring/ring-json "0.3.1"]
                 [ring/ring-defaults "0.1.4"]
                 [http-kit "2.1.19"]
                 [compojure "1.3.2"]
                 [gws/clj-yelp "0.3.0"]]
  :uberjar-name "yalp.jar"
  :omit-source true
  :main yalp.core)
