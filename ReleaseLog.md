Dec 10, 2024

Add user entry for Death Date and Burial Date
If Death Date is after Sundown, Death Date = Death Date + 1
If Burial Date is after Sundown, Burial Date = Burial Date + 1
End of Shiva = Burial Date + 7
End of Shloshim = Burial Date + 30
Yahrzeit = Hebrew Death Date + 1 Year
Hebrew Death Date is converted using Hcal lib
Gregorian Yahrzeit is converted using Hcal lib
Translation is added for Hebrew and Russian under translateInputLabels function
Confirming Yahrzeit calculation during leap year, 
    if death month = Adar I during leap year, Yahrzeit month = Adar I during leap years or during regular years
    if death month = Adar II during leap year, Yahrzeit month = Adar II during leap years or during regular years
Add Check if burial date is same or after death date
Add Check if burial date is selected
Add (after Shacharit) for End of Shiva
Add  (at sundown) for End of Shloshim
Add Spanish and French translations

