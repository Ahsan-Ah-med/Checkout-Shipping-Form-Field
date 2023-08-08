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
} from '@shopify/ui-extensions-react/checkout';
import { useEffect, useState } from 'react';

export default reactExtension(
  'purchase.checkout.actions.render-before',
  () => <Extension />,
);

function Extension() {
  const translate = useTranslate();
  const { extension, localization } = useApi();
  const [countryCode, setCountryCode] = useState('')

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
  const setHouseNo = useApplyMetafieldsChange();
  const houseNo = useMetafield({
    namespace: "custom",
    key: "house"
  });
  return (
    <>
      {
        countryCode === "NL" && <TextField
          label="House No"
          // @ts-ignore
          value={houseNo?.value}
          required
          onChange={(value) => {
            setHouseNo({
              type: "updateMetafield",
              namespace: "custom",
              key: "house",
              valueType: "string",
              value,
            });
          }}
        />
      }
    </>
  );
}