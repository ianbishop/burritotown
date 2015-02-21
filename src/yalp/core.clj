(ns yalp.core
  (:require [gws.yelp.client :as client]
            [gws.yelp.api :as api]
            [yalp.categories :refer [categories]]))

(def client (client/create "srPht7h4VlGY4o11-8eMvA"
                           "Zad1-cGu7kaKbxfUG8AO8bWJbAE"
                           "29MHABVcD9r6Y8SEfhsR_m00G_wpd8kG"
                           "H0_wVL_mo0T86jDwq90l2ywFqYo"))


(defn cats-for-city
  [city categories]
  (reduce-kv (fn [acc key label]
               (let [t (:total (api/search client
                                           {:location city
                                            :category_filter (name key)}))]
                 (assoc acc label t)))
             {}
             categories))

(defn city-comp
  [city1 pop1 city2 pop2]
  (reduce-kv (fn [a label value]
               (let [other-val (or (get city2 label) 0)]
                 (conj a [label (- (/ (or value 0) pop1) (/ other-val pop2))])))
             [] city1))
