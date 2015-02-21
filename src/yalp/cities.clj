(ns yalp.cities)

(def cities
  {"Charlottetown" 42602
   "Hamilton" 670580
   "Grande Prairie" 54913
   "Shawinigan" 47735
   "Saint-Hyacinthe" 48576
   "Prince Albert" 35552
   "Kitchener" 444681
   "Fredericton" 61522
   "Oshawa" 290937
   "Brandon" 46061
   "Georgetown" 40150
   "Woodstock" 37362
   "Orillia" 30586
   "Guelph" 122362
   "Vancouver" 2135201
   "Sudbury" 106840
   "Abbotsford" 149855
   "Penticton" 36902
   "Chilliwack" 66382
   "Stratford" 30886
   "Victoria" 316327
   "St. Thomas" 41688
   "Sherbrooke" 140628
   "Medicine Hat" 65671
   "Peterborough" 80660
   "Rimouski" 37664
   "Moncton" 107086
   "Sault Ste. Marie" 67646
   "Kingston" 117787
   "Saint John" 95902
   "Lethbridge" 83679
   "St. Catharines - Niagara" 309319
   "Chicoutimi - JonquiËre" 106666
   "Windsor" 276165
   "Regina" 192756
   "Vernon" 44600
   "Drummondville" 66314
   "Winnipeg" 671551
   "Courtenay" 40809
   "Thunder Bay" 102222
   "Sarnia" 79526
   "Cape Breton - Sydney" 31597
   "Toronto" 5132794
   "Edmonton" 960015
   "Calgary" 1095404
   "Ch‚teaugua" 70812
   "White Rock" 82368
   "Fort McMurray" 61374
   "Airdrie" 42564
   "Timmins" 30614
   "London" 366191
   "Kanata" 101760
   "Moose Jaw" 33617
   "Milton" 75573
   "Granby" 60281
   "Chatham" 44074
   "Brantford" 93650
   "Sorel" 36969
   "Midland" 31428
   "Joliette" 42883
   "Saskatoon" 222035
   "QuÈbec" 696946
   "Belleville" 63985
   "Campbell River" 34514
   "Red Deer" 90207
   "MontrÈal" 3407963
   "Leamington" 31254
   "Ottawa - Gatineau" 697267
   "Barrie" 166634
   "Saint-JÈrÙme" 65825
   "Orangeville" 30729
   "Kelowna" 141767
   "Bowmanville - Newcastle" 43555
   "St. John's" 165346
   "Cornwall" 49243
   "Nanaimo" 88799
   "Victoriaville" 41701
   "Trois-RiviËres" 126460
   "North Bay" 53515
   "Saint-Jean-sur-Richelieu" 83053
   "Halifax" 297943
   "Salaberry-de-Valleyfield" 39391
   "Beloeil" 50796
   "Kamloops" 73472
   "Prince George" 65503})

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
