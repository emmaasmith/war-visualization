cc = read.csv("../data/other/CountryCodes.csv", header=TRUE, stringsAsFactors=FALSE)
cc2 = cc[c("ISO.3166.1.Number", "Common.Name", "ISO.3166.1.2.Letter.Code", "ISO.3166.1.3.Letter.Code","Formal.Name")]
names(cc2) = c("CId", "CName", "C2code", "C3code", "FormName")
cow = read.csv("../data/other/COWCC.csv", header=TRUE, stringsAsFactors=FALSE)
names(cow) = c("C3code", "cowCode", "StateName")
cow2 = cow[!duplicated(cow$C3code),]

#merge
m1 = merge(cc2, cow2, by="C3code", all=FALSE)
m1=m1[,-3]
m2 = merge(cc2, cow2, by.x="CName", by.y="StateName", all=FALSE)
m2=m2[,-4]
names(m2) = c("StateName", "CId", "C2code", "FormName", "C3code", "cowCode")
m3 = merge(cc2, cow2, by.x="FormName", by.y="StateName", all=FALSE)
m3=m3[,-5]
names(m3) = c("FormName", "CId", "StateName", "C2code", "C3code", "cowCode")

#compile
bind = rbind(m1, m2, m3)
fin = bind[!duplicated(bind$C3code),]

fin2 = merge(fin, cow2, by="cowCode", all.y=TRUE)
fin2=fin2[,c(-2, -4, -5, -6)]
names(fin2) = c("cowCode", "CId", "C3code", "StateName")

write.csv(fin2, "../data/other/CCFin.csv", na="0", row.names=FALSE)

