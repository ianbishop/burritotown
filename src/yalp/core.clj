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
            [ring.middleware.defaults :as mw])
  (:gen-class))

(def cache (atom {}))

(def client (client/create "srPht7h4VlGY4o11-8eMvA"
                           "Zad1-cGu7kaKbxfUG8AO8bWJbAE"
                           "29MHABVcD9r6Y8SEfhsR_m00G_wpd8kG"
                           "H0_wVL_mo0T86jDwq90l2ywFqYo"))
(defn large->small
  [v1 pop1 v2 pop2]
  (- v1 (long (Math/log (* (/ pop1 pop2)
                           (Math/pow Math/E (* Math/E v2)))))))

(defn small->large
  [v1 pop1 v2 pop2]
  (- v1 (long (/ (Math/log (* (/ pop1 pop2)
                              (Math/pow (double v2) Math/E)))
                 Math/E))))


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

(defn json-wrapper
  [& body]
  (let [[status body] (if (number? (first body))
                         [(first body) (rest body)]
                         [200 body])]
    `(try
       (response (do ~@body) :status ~status)
       (catch Exception e#
         (log/error e# "API ERROR")
         (response (or (ex-data e#) (str e#)) :status 400)))))

(def api-routes
  (routes
    (context "/city/:city" [city]
      (GET "/" []
        (found [city (get cities city)]
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
            (found [subcats (get categories category)]
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

(def app
  (routes
    (GET "/" [] (r/resource-response "index.html" {:root "public"}))
    (route/resources "/")
    api-routes
    (route/not-found (r/resource-response "404.html" {:root "public"}))))

(def handler
  (-> app
      (mw/wrap-defaults mw/api-defaults)
      (json/wrap-json-body {:keywords? true})
      json/wrap-json-response))

(defn -main [& args]
  (run-server handler {:port 8080}))
