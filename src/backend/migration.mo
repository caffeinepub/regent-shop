import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Stripe "stripe/stripe";

module {
  type OldUserProfile = {
    name : Text;
  };

  type OldProduct = {
    id : Text;
    name : Text;
    category : Text;
    description : Text;
    price : Float;
    imageUrl : Text;
    stock : Int;
    isActive : Bool;
  };

  type OldOrderItem = {
    productId : Text;
    name : Text;
    size : Text;
    quantity : Nat;
    unitPrice : Float;
  };

  type OldOrder = {
    id : Text;
    userId : Principal;
    items : [OldOrderItem];
    totalAmount : Float;
    status : Text;
    stripePaymentIntentId : Text;
  };

  type OldActor = {
    userProfiles : Map.Map<Principal, OldUserProfile>;
    products : Map.Map<Text, OldProduct>;
    orders : Map.Map<Text, OldOrder>;
    configuration : ?Stripe.StripeConfiguration;
  };

  type SiteSettings = {
    heroTitle : Text;
    heroSubtitle : Text;
    heroTagline : Text;
    shopSectionTitle : Text;
    footerTagline : Text;
    siteName : Text;
  };

  type NewUserProfile = {
    name : Text;
  };

  type NewProduct = {
    id : Text;
    name : Text;
    category : Text;
    description : Text;
    price : Float;
    imageUrl : Text;
    stock : Int;
    isActive : Bool;
  };

  type NewOrderItem = {
    productId : Text;
    name : Text;
    size : Text;
    quantity : Nat;
    unitPrice : Float;
  };

  type NewOrder = {
    id : Text;
    userId : Principal;
    items : [NewOrderItem];
    totalAmount : Float;
    status : Text;
    stripePaymentIntentId : Text;
  };

  type NewActor = {
    siteSettings : SiteSettings;
    userProfiles : Map.Map<Principal, NewUserProfile>;
    products : Map.Map<Text, NewProduct>;
    orders : Map.Map<Text, NewOrder>;
    configuration : ?Stripe.StripeConfiguration;
  };

  public func run(old : OldActor) : NewActor {
    let siteSettings : SiteSettings = {
      heroTitle = "Timeless Style, Effortlessly Yours";
      heroSubtitle = "New Collection";
      heroTagline = "Regent Shop";
      shopSectionTitle = "Our Collection";
      footerTagline = "Timeless Style, Effortlessly Yours";
      siteName = "Regent Shop";
    };
    { old with siteSettings };
  };
};
