(ns yalp.core
  (:require [compojure
             [core :refer :all]
             [route :as route]
             [handler :as handler]]
            [org.httpkit.server :refer :all]
            [ring.middleware
             [json :as json]]
            [ring.util.response :as r]
            [gws.yelp.client :as client]
            [gws.yelp.api :as api]
            [yalp
             [cities :refer [cities] :as cities]
             [categories :refer [categories]]]
            [clojure.tools.logging :as log]
            [ring.middleware.defaults :as mw]
            [clojure.java.io :as io]
            [clojure.data.csv :as csv])
  (:gen-class))

(def cache (atom {}))

(def client (client/create "srPht7h4VlGY4o11-8eMvA"
                           "Zad1-cGu7kaKbxfUG8AO8bWJbAE"
                           "29MHABVcD9r6Y8SEfhsR_m00G_wpd8kG"
                           "H0_wVL_mo0T86jDwq90l2ywFqYo"))
(defn large->small
  [v1 pop1 v2 pop2]
  (let [inside (* (/ pop1 pop2)
                  (Math/pow Math/E (* Math/E v2)))]
    (- v1 (long (if (zero? inside) 0 (Math/log inside))))))

(defn small->large
  [v1 pop1 v2 pop2]
  (let [inside (* (/ pop1 pop2)
                  (Math/pow (double v2) Math/E))]
    (- v1 (long (/ (if (zero? inside) 0 (Math/log inside))
                   Math/E)))))


(defn city-comp
  [city1 pop1 city2 pop2]
  (let [eq (if (> pop1 pop2)
             large->small
             small->large)]
    (->> (reduce-kv (fn [a label value]
                      (let [value (or value 0)
                            other-val (or (get city2 label) 0)]
                        (conj a [label (eq value pop1 other-val pop2)])))
                    [] city1)
         (sort-by second)
         reverse
         (map first)
         (take 5))))

(defn cats-for-city
  [city categories]
  (reduce-kv (fn [acc key label]
               (if-let [cached (get @cache (format "%s/%s" city (name key)))]
                 (assoc acc label cached)
                 (let [t (:total (api/search client
                                             {:location city
                                              :category_filter (name key)}))]
                   (swap! cache assoc (format "%s/%s" city (name key)) t)
                   (assoc acc label t))))
             {}
             categories))

(defmacro found
  [bindings & body]
  `(if-let ~bindings
     (do ~@body)
     (r/not-found nil)))

(defn response
  [body & {:keys [status headers]
           :or {status 200 headers {}}}]
  {:status status
   :headers headers
   :body body})

(defmacro json-wrapper
  [& body]
  (let [[status body] (if (number? (first body))
                         [(first body) (rest body)]
                         [200 body])]
    `(try
       (r/content-type (response (do ~@body) :status ~status)
                       "application/json")
       (catch Exception e#
         (log/error e# "API ERROR")
         (response (or (ex-data e#) (str e#)) :status 400)))))

(defn api-routes
  [city-data]
  (routes
    (context "/city/:city" [city]
      (GET "/" []
        (found [city (merge (get cities city)
                            (get city-data city))]
          (json-wrapper city)))
      (GET "/similar" []
        (found [_ (get cities city)]
          (if-let [cached (get @cache (str "similar/" city))]
            (json-wrapper cached)
            (let [similar (cities/similar city)]
              (swap! cache assoc (str "similar/" city) {:similar similar})
              (json-wrapper {:similar similar})))))
      (GET "/compare/:category/:other" [category other]
        (found [_ (get cities city)]
          (found [_ (get cities other)]
            (found [subcats (get categories (keyword category))]
              (if-let [cached (get @cache (format "%s/compare/%s/%s" city category other))]
                (json-wrapper cached)
                (let [c1 (cats-for-city city subcats)
                      c2 (cats-for-city other subcats)
                      c1c2comp (city-comp c1
                                          (get-in cities [city :population])
                                          c2
                                          (get-in cities [city :population]))]
                  (swap! cache assoc (format "%s/compare/%s/%s" city category other) c1c2comp)
                  (json-wrapper c1c2comp))))))))))

(defn app
  [city-data]
  (routes
    (api-routes city-data)
    (route/resources "/")
    (route/not-found (-> (r/resource-response "404.html" {:root "public"})
                         (r/content-type "text/html")))))

(defn handler
  [city-data]
  (-> (app city-data)
      (mw/wrap-defaults mw/api-defaults)
      (json/wrap-json-body {:keywords? true})
      json/wrap-json-response))

(defn -main [& args]
  (let [content (with-open [rdr (io/reader "city-data.csv")]
                  (doall (csv/read-csv rdr)))
        headers (map keyword (rest (first content)))
        city-data (reduce (fn [a l]
                            (let [[k & data] l
                                  data (into {} (map (fn [k v] [k v]) headers data))]
                              (assoc a k data)))
                          {}
                          content)]
    (run-server (handler city-data) {:port 8080}))
  (log/info "Server started"))
