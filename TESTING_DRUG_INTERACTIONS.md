# 🧪 Testing Drug Interactions (تعارض الأدوية)

## Access the Drug Interactions Dashboard

**URL:** `http://localhost:5173/pharmacy/interactions`

**Required Role:** Pharmacist or Admin

**Test Accounts:**
- Email: `pharmacy@meditrack.com`
- Password: `password123`

---

## 📊 Current Seeded Interactions (7 total)

### 🔴 HIGH SEVERITY (2)
1. **Aspirin + Warfarin**
   - Risk: Severe bleeding due to combined anticoagulant effects
   
2. **Metformin + Insulin Glargine**
   - Risk: Severe hypoglycemia (dangerously low blood sugar)

### 🟡 MODERATE SEVERITY (3)
1. **Ibuprofen + Lisinopril**
   - Risk: Reduced blood pressure control and kidney damage
   
2. **Sertraline + Alprazolam**
   - Risk: Enhanced CNS depression (drowsiness, confusion)
   
3. **Levothyroxine + Omeprazole**
   - Risk: Reduced thyroid hormone absorption

### 🔵 LOW SEVERITY (2)
1. **Azithromycin + Omeprazole**
   - Risk: Minor absorption interaction
   
2. **Paracetamol + Omeprazole**
   - Risk: Generally safe but worth noting

---

## 🧪 Testing Steps

### 1. **View All Interactions**
- Navigate to `http://localhost:5173/pharmacy/interactions`
- See all 7 interactions displayed as cards
- Notice severity badges (🔴🟡🔵)

### 2. **Filter by Severity**
- Click severity filter buttons: **High**, **Moderate**, **Low**, **All**
- Verify correct filtering:
  - "High" → Shows 2 interactions
  - "Moderate" → Shows 3 interactions
  - "Low" → Shows 2 interactions

### 3. **Search Functionality**
- Search by medication name:
  - Try: `Aspirin` → Shows Aspirin + Warfarin
  - Try: `Omeprazole` → Shows 3 interactions with Omeprazole
  - Try: `Insulin` → Shows Metformin + Insulin Glargine
- Search by description keywords:
  - Try: `bleeding` → Shows Aspirin + Warfarin
  - Try: `hypoglycemia` → Shows Metformin + Insulin

### 4. **Add New Interaction**
- Click **"+ Add Interaction"** button
- Fill in form:
  - First Medication: Select from dropdown
  - Second Medication: Select different medication
  - Severity: Choose HIGH/MODERATE/LOW
  - Description: Enter interaction details
- Click **Create**
- Verify new interaction appears in list

**Example to add:**
- Aspirin + Ibuprofen
- Severity: MODERATE
- Description: "Both NSAIDs; combined use increases GI bleeding risk"

### 5. **Edit Interaction**
- Click the **blue Edit button** (✏️) on any interaction
- Modify any field
- Click **Update**
- Verify changes appear in list

**Example:**
- Edit Aspirin + Warfarin severity from HIGH to MODERATE
- Save and confirm change

### 6. **Delete Interaction**
- Click the **red Delete button** (🗑️) on any interaction
- Confirm deletion in popup
- Verify interaction is removed

### 7. **Statistics**
- View stats at bottom:
  - Total Interactions
  - High Risk count
  - Moderate Risk count
- Stats should update when adding/deleting

---

## 🎯 Key Features to Verify

✅ **Severity Badges**
- HIGH = Red with ⚠️ icon
- MODERATE = Orange with ⚡ icon
- LOW = Blue with 💡 icon

✅ **Responsive Design**
- Works on desktop (full width)
- Works on tablet (2-column layout)
- Works on mobile (single column)

✅ **Animations**
- Smooth card entrance animations
- Smooth filter transitions
- Modal pop-in animations

✅ **Form Validation**
- Prevents selecting same medication twice
- Requires all fields filled
- Prevents duplicate interactions (same pair, either direction)

✅ **Real-time Updates**
- Changes appear immediately
- Stats update automatically
- No page refresh needed

---

## 📱 Example Scenarios

### Scenario 1: Checking for a Known Interaction
**Patient is prescribed:** Aspirin + Warfarin
1. Go to Drug Interactions page
2. Search "Aspirin"
3. Find interaction showing HIGH severity
4. Alert: This combination is dangerous!

### Scenario 2: Monitoring Omeprazole Interactions
**Patient needs to take:** Omeprazole
1. Search "Omeprazole" on interactions page
2. Find 3 interactions:
   - With Azithromycin (LOW)
   - With Paracetamol (LOW)
   - With Levothyroxine (MODERATE - space out doses!)

### Scenario 3: Adding New Interaction
**Research shows new interaction:**
1. Click "+ Add Interaction"
2. Fill form with new medication pair
3. Set appropriate severity
4. Save

---

## 🔗 API Endpoints (for manual testing)

### Get All Interactions
```bash
curl http://localhost:5002/api/pharmacy/interactions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create Interaction
```bash
curl -X POST http://localhost:5002/api/pharmacy/interactions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "medication1Id": 1,
    "medication2Id": 2,
    "severity": "HIGH",
    "description": "Test interaction"
  }'
```

### Update Interaction
```bash
curl -X PUT http://localhost:5002/api/pharmacy/interactions/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "medication1Id": 1,
    "medication2Id": 3,
    "severity": "MODERATE",
    "description": "Updated description"
  }'
```

### Delete Interaction
```bash
curl -X DELETE http://localhost:5002/api/pharmacy/interactions/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## ✅ Testing Checklist

- [ ] All 7 interactions load correctly
- [ ] Severity filtering works (High/Moderate/Low/All)
- [ ] Search by medication name works
- [ ] Search by description works
- [ ] Can add new interaction
- [ ] Can edit existing interaction
- [ ] Can delete interaction
- [ ] Statistics update correctly
- [ ] Form prevents duplicate interactions
- [ ] Form prevents same medication twice
- [ ] Responsive design on mobile
- [ ] Animations are smooth
- [ ] Error handling works (show errors if API fails)

---

**Good luck testing! 🚀**

If you find any issues or want to add more interactions, let me know! 👨‍⚕️
