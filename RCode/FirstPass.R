MID_raw = read.csv("../data/MilitarizedInterstateDisputes/MIDa_4.01.csv", header=TRUE, stringsAsFactors=FALSE)
loc_raw = read.csv("../data/MilitarizedInterstateDisputes/MIDLOC_1.1.csv", header=TRUE, stringsAsFactors=FALSE)


MID_f = MID_raw[c("DispNum3", "StDay", "StMon", "StYear", "EndDay", "EndMon", "EndYear", "Outcome", "Settle", "Fatality", "HiAct", "HostLev", "Recip", "NumA", "NumB", "Ongo2010")]
loc_f = loc_raw[c("dispnum", "incidnum", "year", "mid21location", "latitude", "longitude", "onset")]
names(loc_f)[4] = "loctext"

# Date cleaning
MID_f$StDay[MID_f$StDay == -9] = 1
MID_f$StMon[MID_f$StMon == -9] = 1
MID_f$EndDay[MID_f$EndDay == -9] = 1
MID_f$EndMon[MID_f$EndMon == -9] = 1

library(stringr)
MID_f$StDay = str_pad(MID_f$StDay, 2, pad = "0")
MID_f$StMon = str_pad(MID_f$StMon, 2, pad = "0")
MID_f$EndDay = str_pad(MID_f$EndDay, 2, pad = "0")
MID_f$EndMon = str_pad(MID_f$EndMon, 2, pad = "0")
MID_f$StDate = paste(MID_f$StDay, MID_f$StDay, MID_f$StYear, sep = "/", collapse = NULL)
MID_f$EndDate = paste(MID_f$EndDay, MID_f$EndDay, MID_f$EndYear, sep = "/", collapse = NULL)


full = merge(MID_f, loc_f, by.x="DispNum3", by.y="dispnum", all=TRUE)

write.csv(full, "../data/maps/final/MID.csv", na="0", row.names=FALSE)


# capabilities_raw = read.csv("../data/NationalMaterialCapabilities/NMC_v4_0.csv", header=TRUE, stringsAsFactors=FALSE)

