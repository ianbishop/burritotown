(ns yalp.cities)

(def cities
  {"Abbotsford" {:age 38 :population 149855 :income 26710}
   "Barrie" {:age 38 :population 166634 :income 33140}
   "Belleville" {:age 41 :population 63985 :income 28320}
   "Brandon" {:age 37 :population 46061 :income 31000}
   "Brantford" {:age 39
                :population 93650
                :income 31100}
   "Calgary" {:age 36
              :population 1095404
              :income 41970}
   "Campbell River" {:age 42
                     :population 34514
                     :income 26550}
   "Cape Breton" {:age 43
                  :population 31597
                  :income 25470}
   "Charlottetown" {:age 40
                    :population 42602
                    :income 28010}
   "Chatham" {:age 41
              :population 44074
              :income 25080}
   "Chilliwack" {:age 40
                 :population 66382
                 :income 26480}
   "Cornwall" {:age 42
               :population 49243
               :income 26700}
   "Courtenay" {:age 45
                :population 40809
                :income 22470}
   "Drummondville" {:age 40
                    :population 66314
                    :income 27700}
   "Edmonton" {:age 37
               :population 960015
               :income 42440}
   "Fredericton" {:age 39
                  :population 61522
                  :income 32660}
   "Granby" {:age 41
             :population 60281
             :income 28230}
   "Grande Prairie" {:age 32
                     :population 54913
                     :income 46050}
   "Guelph" {:age 39
             :population 122362
             :income 36770}
   "Halifax" {:age 40
              :population 297943
              :income 33400}
   "Hamilton" {:age 40
               :population 670580
               :income 33690}
   "Joliette" {:age 43
               :population 42883
               :income 28110}
   "Kamloops" {:age 41
               :population 73472
               :income 31300}
   "Kelowna" {:age 42
              :population 141767
              :income 28000}
   "Kingston" {:age 41
               :population 117787
               :income 32110}
   "Kitchener" {:age 38
                :population 444681
                :income 35200}
   "Leamington" {:age 39
                 :population 31254
                 :income 21470}
   "Lethbridge" {:age 37
                 :population 83679
                 :income 32340}
   "London" {:age 39
             :population 366191
             :income 31470}
   "Medicine Hat" {:age 39
                   :population 65671
                   :income 35070}
   "Midland" {:age 43
              :population 31428
              :income 27390}
   "Moncton" {:age 40
              :population 107086
              :income 30960}
   "Montreal" {:age 39
               :population 3407963
               :income 30760}
   "Moose Jaw" {:age 40
                :population 33617
                :income 34010}
"Nanaimo" {:age 43
           :population 88799
           :income 26190}
"North Bay" {:age 41
             :population 53515
             :income 31440}
"Orillia" {:age 43
           :population 30586
           :income 26350}
"Oshawa" {:age 38
          :population 290937
          :income 36110}
"Ottawa" {:age 39
          :population 697267
          :income 40300}
"Penticton" {:age 46
             :population 36902
             :income 23200}
"Peterborough" {:age 42
                :population 80660
                :income 27730}
"Prince Albert" {:age 36
                 :population 35552
                 :income 32640}
"Prince George" {:age 38
                 :population 65503
                 :income 35120}
"Quebec" {:age 41
          :population 696946
          :income 33880}
"Red Deer" {:age 35
            :population 90207
            :income 38250}
"Regina" {:age 37
          :population 192756
          :income 39600}
"Rimouski" {:age 43
            :population 37664
            :income 29480}
"Saint John" {:age 40
              :population 95902
              :income 31710}
"Saint-Hyacinthe" {:age 43
                   :population 48576
                   :income 28660}
"Saint-Jean-sur-Richelieu" {:age 40
                            :population 83053
                            :income 31530}
"Sarnia" {:age 37
          :population 79526
          :income 37070}
"Saskatoon" {:age 42
             :population 222035
             :income 27690}
"Sault Ste. Marie" {:age 46
                    :population 67646
                    :income 24570}
"Shawinigan" {:age 41
              :population 47735
              :income 28330}
"Sherbrooke" {:age 45
              :population 14062836969
              :income 29630}
"St. Catharines" {:age 42
                            :population 309319
                            :income 26130}
"St. John's" {:age 39
              :population 165346
              :income 37210}
"Stratford" {:age 42
             :population 30886
             :income 31860}
"Sudbury" {:age 40
           :population 106840
           :income 34530}
"Thunder Bay" {:age 41
               :population 102222
               :income 34080}
"Timmins" {:age 39
           :population 30614
           :income 35660}
"Toronto" {:age 38
           :population 5132794
           :income 32670}
"Trois-Rivieres" {:age 43
                  :population 126460
                  :income 27680}
"Vancouver" {:age 40
             :population 2135201
             :income 30650}
"Vernon" {:age 44
          :population 44600
          :income 25680}
"Victoria" {:age 43
            :population 316327
            :income 30170}
"Victoriaville" {:age 42
                 :population 41701
                 :income 26950}
"Windsor" {:age 39
           :population 276165
           :income 28350}
"Winnipeg" {:age 39
            :population 671551
            :income 33090}
"Woodstock" {:age 40
             :population 37362
             :income 33590}})

(defn dist [x y]
  (Math/sqrt (+ (Math/pow (- (:age x) (:age y)) 2)
                (Math/pow (- (:population x) (:population y)) 2)
                (Math/pow (- (:income x) (:income y)) 2))))

(defn similar
  [city]
  (let [v (get cities city)
        distances (reduce-kv (fn [a2 k2 v2]
                               (assoc a2 k2 (dist v v2)))
                             {} cities)
        distances (into (sorted-map-by (fn [k1 k2]
                                         (compare [(get distances k1) k1]
                                                  [(get distances k2) k2])))
                        distances)]
    (mapv first (rest (take 4 (seq distances))))))
