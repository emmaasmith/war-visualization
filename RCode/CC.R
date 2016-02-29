cc = read.csv("../data/other/CountryCodes.csv", header=TRUE, stringsAsFactors=FALSE)
fin = cc[c("ISO.3166.1.Number", "Common.Name", "ISO.3166.1.2.Letter.Code", "ISO.3166.1.3.Letter.Code")]
names(fin) = c("CId", "CName", "C2code", "C3code")
write.csv(fin, "../data/other/CC.csv", na="0", row.names=FALSE)

