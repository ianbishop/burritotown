(ns yalp.cities)

(def cities
  {"Abbotsford" {:population 149855}
   "Barrie" {:population 166634}
   "Belleville" {:population 63985}
   "Brandon" {:population 46061}
   "Brantford" {:population 93650}
   "Calgary" {:population 1095404}
   "Campbell River" {:population 34514}
   "Cape Breton - Sydney" {:population 31597}
   "Charlottetown" {:population 42602}
   "Chatham" {:population 44074}
   "Chilliwack" {:population 66382}
   "Cornwall" {:population 49243}
   "Courtenay" {:population 40809}
   "Drummondville" {:population 66314}
   "Edmonton" {:population 960015}
   "Fredericton" {:population 61522}
   "Granby" {:population 60281}
   "Grande Prairie" {:population 54913}
   "Guelph" {:population 122362}
   "Halifax" {:population 297943}
   "Hamilton" {:population 670580}
   "Joliette" {:population 42883}
   "Kamloops" {:population 73472}
   "Kelowna" {:population 141767}
   "Kingston" {:population 117787}
   "Kitchener" {:population 444681}
   "Leamington" {:population 31254}
   "Lethbridge" {:population 83679}
   "London" {:population 366191}
   "Medicine Hat" {:population 65671}
   "Midland" {:population 31428}
   "Moncton" {:population 107086}
   "MontrÈal" {:population 3407963}
   "Moose Jaw" {:population 33617}
   "Nanaimo" {:population 88799}
   "North Bay" {:population 53515}
   "Orillia" {:population 30586}
   "Oshawa" {:population 290937}
   "Ottawa - Gatineau" {:population 697267}
   "Penticton" {:population 36902}
   "Peterborough" {:population 80660}
   "Prince Albert" {:population 35552}
   "Prince George" {:population 65503}
   "QuÈbec" {:population 696946}
   "Red Deer" {:population 90207}
   "Regina" {:population 192756}
   "Rimouski" {:population 37664}
   "Saint John" {:population 95902}
   "Saint-Hyacinthe" {:population 48576}
   "Saint-Jean-sur-Richelieu" {:population 83053}
   "Salaberry-de-Valleyfield" {:population 39391}
   "Sarnia" {:population 79526}
   "Saskatoon" {:population 222035}
   "Sault Ste. Marie" {:population 67646}
   "Shawinigan" {:population 47735}
   "Sherbrooke" {:population 140628}
   "Sorel" {:population 36969}
   "St. Catharines - Niagara" {:population 309319}
   "St. John's" {:population 165346}
   "Stratford" {:population 30886}
   "Sudbury" {:population 106840}
   "Thunder Bay" {:population 102222}
   "Timmins" {:population 30614}
   "Toronto" {:population 5132794}
   "Trois-RiviËres" {:population 126460}
   "Vancouver" {:population 2135201}
   "Vernon" {:population 44600}
   "Victoria" {:population 316327}
   "Victoriaville" {:population 41701}
   "Windsor" {:population 276165}
   "Winnipeg" {:population 671551}
   "Woodstock" {:population 37362}})

(defn dist [x y]
  (Math/abs (- x y)))

(reduce-kv (fn [a k v]
             (let [distances (reduce-kv (fn [a2 k2 v2]
                                          (assoc a2 k2 (dist v v2)))
                                        {} cities)
                   distances (into (sorted-map-by (fn [k1 k2]
                                                    (compare [(get distances k1) k1]
                                                             [(get distances k2) k2])))
                                   distances)]
               (assoc a k (mapv first (rest (take 4 (seq distances)))))))
           {}
           cities)
