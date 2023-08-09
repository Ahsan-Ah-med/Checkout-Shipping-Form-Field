import {
  useApi,
  useTranslate,
  reactExtension,
  useLocalizationCountry,
  useShippingAddress,
  useApplyShippingAddressChange,
  TextField,
  useMetafield,
  useApplyMetafieldsChange,
  useExtensionCapability,
  useBuyerJourneyIntercept,
} from '@shopify/ui-extensions-react/checkout';
import { useEffect, useState } from 'react';

export default reactExtension(
  'purchase.checkout.delivery-address.render-before',
  () => <Extension />,
);

function Extension() {
  const translate = useTranslate();
  const { extension, localization } = useApi();
  const [countryCode, setCountryCode] = useState('')
  const [house, setHouse] = useState("");
  const [validationError, setValidationError] = useState("");


  const canBlockProgress = useExtensionCapability("block_progress");
  const label = canBlockProgress ? "House No" : "House No (optional)";

  //@ts-ignore
  useBuyerJourneyIntercept(({ canBlockProgress }) => {
    // Validate that the house of the buyer is known, and that they're old enough to complete the purchase
    if (canBlockProgress && !ishouseSet()) {
      return {
        behavior: "block",
        reason: "house no is required",
        perform: (result) => {
          // If progress can be blocked, then set a validation error on the custom field
          if (result.behavior === "block") {
            setValidationError("Enter your house");
          }
        },
      };
    }

    return {
      behavior: "allow",
      perform: () => {
        // Ensure any errors are hidden
        clearValidationErrors();
      },
    };
  });

  function ishouseSet() {
    return house !== "";
  }

  function clearValidationErrors() {
    setValidationError("");
  }
  const makeRequest = async () => {
    try {
      const local = await useLocalizationCountry()
      console.log(local);
      console.log(localization.country);
    } catch (error) {
      console.error(error)
    }
  }

  const makeRequest_ship = async () => {
    try {
      const local_ship = await useShippingAddress()
      //@ts-ignore
      setCountryCode(local_ship?.countryCode);
    } catch (error) {
      console.error(error)
    }
  }

  makeRequest_ship();


  const houseAPi = useApplyMetafieldsChange();
  const houseNo = useMetafield({
    namespace: "custom",
    key: "house"
  });
  return (
    <>
      {countryCode === "NL" && (
        <TextField
          label={label}
          // @ts-ignore
          value={houseNo?.value}
          required={canBlockProgress}
          // @ts-ignore
          error={!!validationError}
          helperText={validationError}
          onInput={clearValidationErrors}
          onChange={(value) => {
            setHouse(value);
            houseAPi({
              type: "updateMetafield",
              namespace: "custom",
              key: "house",
              valueType: "string",
              value,
            });
          }}
        />
      )}
    </>
  );
}