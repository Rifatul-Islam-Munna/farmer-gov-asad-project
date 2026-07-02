# Farmer Government Platform — Product and Technical Plan

## 1. Purpose

The Farmer Government Platform will connect farmers, buyers, field agents, medicine sellers, and administrators in one mobile-first agricultural ecosystem.

The platform will help farmers:

1. Identify crop insects or diseases from a phone camera image and receive treatment suggestions.
2. List agricultural goods for sale with quantity, government reference price, and a farmer-defined minimum price.
3. Monitor current and previous market prices and receive practical farming suggestions.

The marketplace will allow buyers to discover goods, contact farmers, negotiate, and complete a deal only after both parties confirm it.

Agents will support farmers who cannot independently use the app by creating verified farmer accounts and posting goods on their behalf with OTP authorization.

Medicine sellers will publish their shop location and available agricultural medicines so the platform can recommend nearby sellers after an insect or disease is identified.

---

## 2. User Roles

The platform will support the following roles:

### 2.1 Admin

Admin users will manage the platform through an administration interface.

Main responsibilities:

- Manage users and role approvals.
- Review agent, buyer, and medicine-seller documents.
- Manage agricultural goods and categories.
- Manage government and market reference prices.
- Review farmer sale posts.
- Review reported users, products, and deals.
- Manage pest, disease, medicine, and pesticide reference data.
- Monitor marketplace activity and platform analytics.

### 2.2 Farmer

Farmer registration information:

- Full name.
- Mobile number.
- Password or OTP-based access.
- Total land amount.
- Optional location information.

Main capabilities:

- Capture or upload crop/insect images.
- Receive a demo insect diagnosis and treatment suggestion.
- View nearby medicine sellers who stock the suggested product.
- Create goods-for-sale posts.
- Search and manually select a good.
- Capture a good image for automatic demo identification.
- Enter available quantity in kilograms.
- View the government reference price.
- Set a minimum acceptable price.
- Publish the sale post.
- Receive buyer offers.
- Accept or reject a proposed deal.
- View current and previous market prices.
- View price increase/decrease indicators.
- View farming suggestions and notices.

### 2.3 Buyer

Buyer registration information:

- Full name.
- Mobile number.
- Required identity or business documents.
- Optional business and location information.

Main capabilities:

- Browse the farmer marketplace.
- Search by goods name and category.
- Filter by location, quantity, minimum price, and availability.
- View farmer listing details.
- View the current government and market price.
- Contact the farmer.
- Submit an offer for a selected quantity and price.
- Confirm the buyer side of a negotiated deal.
- Track pending, accepted, rejected, and completed deals.
- View current agricultural market rates.

### 2.4 Agent

Agent registration information:

- Full name.
- Mobile number.
- Required identity and authorization documents.
- Service location.

Main capabilities:

- Search existing farmers by phone number or identity.
- Create a new farmer account.
- Trigger an OTP to the farmer's phone.
- Complete farmer creation only after OTP confirmation.
- Create a sale listing on behalf of a farmer.
- Select the represented farmer.
- Trigger a posting OTP to the farmer's phone.
- Publish only after the farmer provides the OTP.
- View previously assisted farmers and delegated posts.
- Track agent activity for audit purposes.

### 2.5 Medicine Seller / Pharmacist

Medicine seller registration information:

- Owner or representative name.
- Mobile number.
- Shop name.
- Shop address and geographic coordinates.
- Required business or identity documents.

Main capabilities:

- Maintain shop profile and location.
- Add medicines, pesticides, and agricultural treatment products.
- Set stock availability.
- Update product quantity and availability status.
- Receive farmer inquiries.
- Appear in nearby-shop recommendations when a diagnosis suggests a stocked product.

---

## 3. Farmer Application Experience

## 3.1 Farmer Home Page

The farmer home page will prioritize three primary services.

### A. Crop and Insect Detection

The farmer can:

1. Open the camera or select an image.
2. Submit the image to the detection service.
3. See the detected insect or disease.
4. See confidence, symptoms, and risk level.
5. See recommended medicine or pesticide.
6. See safety instructions and application guidance.
7. See nearby medicine sellers who currently stock the recommendation.

For the first development phase, detection will be a demo implementation. Any submitted image will return the same controlled diagnosis response. The app and backend must still call the feature through proper DTOs, repositories, services, and API endpoints so the demo implementation can later be replaced by a real machine-learning or third-party API without changing the UI flow.

### B. Sell Agricultural Goods

The farmer can create a listing through either method:

- Search and manually select the good.
- Capture or upload an image for automatic demo identification.

The sale form will include:

- Selected good.
- Good image.
- Quantity and unit, initially kilograms.
- Quality or grade.
- Harvest date.
- Location.
- Government reference price.
- Current market price.
- Farmer's minimum acceptable price.
- Optional description.

The system will automatically prefill the government reference price based on the selected good and location. The farmer may set a minimum price according to platform rules.

### C. Market Price and Farmer Suggestions

The farmer can see:

- Current price by good.
- Previous day's price.
- Price difference.
- Percentage change.
- Up, down, or stable indicator.
- Government reference price.
- Regional market price.
- Practical suggestions based on price movement.
- Admin notices and agricultural recommendations.

Initial price information will be managed from platform data or an admin-managed source. External pricing sources can be integrated later.

---

## 4. Marketplace and Deal Workflow

## 4.1 Listing Lifecycle

Recommended listing statuses:

- `draft`
- `pending_otp`
- `published`
- `reserved`
- `sold`
- `expired`
- `cancelled`
- `rejected`

## 4.2 Buyer Offer Lifecycle

A buyer will submit:

- Listing ID.
- Requested quantity.
- Offered unit price.
- Proposed total price.
- Optional message.

Recommended offer statuses:

- `pending`
- `countered`
- `accepted_by_buyer`
- `accepted_by_farmer`
- `confirmed`
- `rejected`
- `cancelled`
- `expired`

A deal becomes confirmed only when both buyer and farmer have accepted the same final terms.

## 4.3 Contact and Negotiation

The first release should support a structured contact action and offer history. Real-time chat may be introduced later.

The platform should retain:

- Original listing terms.
- Every buyer offer.
- Farmer counteroffers.
- Final agreed quantity and price.
- Buyer confirmation time.
- Farmer confirmation time.
- Audit history.

---

## 5. Agent Authorization Workflow

## 5.1 Creating a Farmer Account

1. Agent enters farmer information.
2. Backend validates that the phone number is not already registered.
3. Backend creates a temporary farmer-registration request.
4. OTP is sent to the farmer's phone.
5. Agent enters the OTP provided by the farmer.
6. Backend verifies the OTP.
7. Farmer account is created.
8. Agent action is stored in an audit record.

## 5.2 Posting on Behalf of a Farmer

1. Agent prepares the same sale form used by a farmer.
2. Agent searches and selects a farmer.
3. Backend creates a pending delegated-post request.
4. OTP is sent directly to the farmer.
5. Agent enters the farmer-provided OTP.
6. Backend verifies the OTP and farmer relationship.
7. Listing is published under the farmer's ownership.
8. The listing stores the assisting agent ID for audit purposes.

No agent-created farmer account or delegated listing should become active without farmer OTP verification.

---

## 6. Medicine Seller and Recommendation Workflow

Medicine sellers will maintain an inventory of agricultural treatment products.

Each inventory item should contain:

- Product name.
- Product category.
- Manufacturer.
- Active ingredient.
- Supported pests or diseases.
- Stock status.
- Optional stock quantity.
- Unit and package size.
- Price.
- Last updated time.

After a diagnosis, the recommendation service will:

1. Match the suggested medicine or pesticide to seller inventory.
2. Filter sellers with available stock.
3. Rank sellers by distance from the farmer.
4. Return shop name, location, phone number, distance, and stock status.

The first release may use manually entered seller coordinates and a simple distance calculation.

---

## 7. Demo AI and Third-Party Integration Strategy

The application will use adapter-based integration so demo services can later be replaced without changing feature screens.

## 7.1 Crop/Insect Detection Adapter

Interface responsibilities:

- Receive an uploaded image.
- Return a typed diagnosis response.
- Return treatment recommendations.

Demo behavior:

- Accept any valid image.
- Return one predefined pest or disease.
- Return predefined treatment and medicine suggestions.

Future behavior:

- Call an internal model, cloud vision API, or agricultural AI provider.

## 7.2 Goods Identification Adapter

Interface responsibilities:

- Receive an image.
- Return the identified agricultural good.
- Return a confidence score and suggested category.

Demo behavior:

- Accept any valid image.
- Return one predefined good.

Future behavior:

- Replace the demo provider with an image-classification API.

## 7.3 OTP Adapter

Demo behavior:

- Generate and store an OTP.
- Log or return it only in development mode.

Production behavior:

- Use an SMS gateway.
- Never expose OTP values in production API responses.

## 7.4 Market Price Provider

Initial behavior:

- Read admin-managed prices from the platform database.

Future behavior:

- Import government or market prices from an approved external source.

---

## 8. Backend Architecture

The NestJS backend should be divided into domain modules.

Recommended modules:

- `auth`
- `users`
- `roles`
- `documents`
- `otp`
- `farmers`
- `agents`
- `buyers`
- `medicine-sellers`
- `goods`
- `goods-categories`
- `market-prices`
- `listings`
- `offers`
- `deals`
- `diagnosis`
- `goods-detection`
- `medicines`
- `seller-inventory`
- `locations`
- `notifications`
- `audit-logs`
- `admin`

MongoDB will be the primary database.

Important backend practices:

- DTO validation with `class-validator`.
- Mongoose schemas with explicit indexes.
- Role-based authorization.
- JWT access tokens.
- OTP expiration and attempt limits.
- File upload validation.
- Request and activity audit logs.
- Pagination, filtering, and sorting for marketplace endpoints.
- Consistent API response and error formats.
- Swagger documentation.

---

## 9. Flutter Architecture

The existing Flutter project is located in `farmer/` and must be used. No second Flutter application folder should be created.

Recommended structure:

```text
farmer/lib/
  app/
  core/
    api/
    config/
    errors/
    network/
    router/
    storage/
    theme/
    utils/
    widgets/
  features/
    auth/
    onboarding/
    farmer_home/
    diagnosis/
    marketplace/
    market_prices/
    buyer/
    agent/
    medicine_seller/
    notifications/
    profile/
```

Each feature should be implemented in small, reviewable chunks.

Recommended feature structure:

```text
feature_name/
  data/
    datasources/
    models/
    repositories/
  domain/
    entities/
    repositories/
    usecases/
  presentation/
    pages/
    widgets/
    controllers/
```

A simplified version may be used initially, but API, model, repository, and UI responsibilities must remain separated.

---

## 10. Model and Serialization Standard

Every API model must use Freezed and JsonSerializable.

Example convention:

```dart
import 'package:freezed_annotation/freezed_annotation.dart';

part 'auth_response.model.freezed.dart';
part 'auth_response.model.g.dart';

@freezed
abstract class AuthResponseModel with _$AuthResponseModel {
  const factory AuthResponseModel({
    required String accessToken,
    required UserModel user,
  }) = _AuthResponseModel;

  factory AuthResponseModel.fromJson(Map<String, dynamic> json) =>
      _$AuthResponseModelFromJson(json);
}
```

Rules:

- Do not manually parse production API models unless technically required.
- Keep request DTO models separate from response models.
- Use explicit JSON key annotations when backend and Dart names differ.
- Keep domain entities separate where business logic requires it.
- Run code generation after each model group is implemented.

---

## 11. Navigation Plan

AutoRoute will be used with nested routes.

Proposed route structure:

```text
/
/login
/register
/onboarding
/main
  /farmer
    /home
    /diagnosis
    /sell
    /prices
    /offers
  /buyer
    /marketplace
    /listing/:id
    /offers
    /deals
  /agent
    /home
    /create-farmer
    /post-for-farmer
    /activity
  /medicine-seller
    /home
    /inventory
    /inventory/add
    /shop-profile
  /admin
    /dashboard
```

Navigation will be role-aware after login. A user will be redirected to the correct shell and home page according to their role.

---

## 12. Registration and Onboarding Plan

The registration flow will begin with role selection.

### Farmer

Required:

- Name.
- Phone number.
- Password or OTP.
- Land amount.

### Agent

Required:

- Name.
- Phone number.
- Password.
- Identity or authorization documents.
- Service location.

### Buyer

Required:

- Name.
- Phone number.
- Password.
- Identity or business documents.
- Optional business information.

### Medicine Seller

Required:

- Name.
- Phone number.
- Password.
- Shop name.
- Shop address.
- Location.
- Business or identity documents.

### Admin

Admin accounts should be provisioned securely and should not be available through open public registration.

---

## 13. Security and Trust Requirements

- Hash all passwords.
- Store mobile tokens in secure storage.
- Apply role-based backend guards.
- Use expiring OTPs.
- Limit OTP attempts and resend frequency.
- Record agent actions and delegated operations.
- Validate file type and size.
- Hide private documents from unauthorized roles.
- Prevent users from changing listing ownership.
- Require both parties to confirm final deal terms.
- Preserve deal audit records.
- Protect admin endpoints.
- Use environment variables for secrets and third-party credentials.

---

## 14. Delivery Phases

## Phase 0 — Repository and Architecture Cleanup

- Use the existing `farmer/` Flutter project.
- Remove the accidentally created duplicate Flutter folder.
- Create and work from the `development` branch.
- Add required packages.
- Configure environment loading, Dio, secure storage, Freezed, JsonSerializable, and AutoRoute.

## Phase 1 — Authentication and Role Onboarding

- Splash screen.
- Login.
- Role selection.
- Role-specific registration.
- Document selection UI.
- Farmer land information.
- Secure session storage.
- Logout.
- Role-based nested navigation.

## Phase 2 — Farmer Home and Market Prices

- Farmer dashboard.
- Three main farmer services.
- Market price list.
- Historical comparison and trend indicators.
- Farmer suggestions.

## Phase 3 — Demo Diagnosis

- Camera and gallery image selection.
- Typed diagnosis request and response models.
- Demo diagnosis endpoint and provider.
- Treatment details.
- Nearby medicine seller recommendations.

## Phase 4 — Farmer Marketplace Listing

- Goods master data.
- Goods search.
- Demo image identification.
- Quantity and minimum price form.
- Government reference price autofill.
- Listing creation and farmer listing history.

## Phase 5 — Buyer Marketplace and Deals

- Marketplace browsing and search.
- Listing details.
- Buyer offers.
- Farmer acceptance or counteroffer.
- Buyer and farmer dual confirmation.
- Deal history.

## Phase 6 — Agent Workflows

- Create farmer through OTP.
- Search farmers.
- Post on behalf of farmer through OTP.
- Agent activity history and audit data.

## Phase 7 — Medicine Seller

- Shop onboarding.
- Location data.
- Inventory management.
- Diagnosis-to-nearby-seller matching.

## Phase 8 — Administration and Production Integrations

- Admin management tools.
- Production SMS provider.
- Production AI/image recognition provider.
- Approved market price data source.
- Notifications.
- Reporting, analytics, moderation, and deployment hardening.

---

## 15. Initial Definition of Done

A feature is complete only when:

- Backend schema, DTOs, service, controller, and Swagger documentation are complete.
- Flutter request and response models use Freezed and JsonSerializable.
- Repository and API layers are separated from the UI.
- Loading, success, empty, and error states are implemented.
- Role permissions are enforced on the backend.
- Navigation is connected.
- Basic validation is included.
- Tests or documented manual verification steps exist.
- The corresponding item in `TASKS.md` is checked as complete.

---

## 16. Immediate Next Step

After approval of this plan, implementation should begin with Phase 0 only:

1. Clean up the duplicate Flutter folder.
2. Configure the existing `farmer/` project.
3. Add the supplied package list without custom fonts.
4. Add `.env`, Dio, secure storage, Freezed, JsonSerializable, and AutoRoute.
5. Build the role model and authentication model foundation in small code chunks.
