"use client";

import { useState } from "react";

import { z } from "zod";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { makeStyles } from "tss-react/mui";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Container from "@mui/material/Container";

// Firebase
import { db } from "@/firebase";
import { doc, addDoc, updateDoc, collection } from "firebase/firestore";

// Components
import Loader from "@/components/loader";
import DatePicker from "@/components/datePicker";
import FormHeader from "@/components/forms/components/formHeader";
import FormFooter from "@/components/forms/components/formFooter";

// Inputs
import TextInput from "@/components/inputs/textInput";
import SelectInput from "@/components/inputs/selectInput";

// Utils
import { getCurrentLocation } from "@/utils";

// Constants
import {
  SHAPES,
  YES_NO,
  SIZE_OPTIONS,
  QC_INSPECTORS,
  QUALITY_OPTIONS,
  FIELD_CONDITIONS,
  USES_WHATSAPP_OPTIONS,
  VEHICLE_ENTERING_CONDITIONS,
} from "@/constants";

const schema = z.object({
  qcInspector: z
    .string()
    .min(1, "QC Inspector is required")
    .nullable()
    .refine((val) => val !== null, "QC Inspector is required"),
  qcDate: z.string().min(1, "QC Date is required"),
  readyToHarvest: z.string().min(1, "Ready to Harvest date is required"),
  heightOfTree: z
    .number()
    .nonnegative("Please enter a valid height of tree")
    .refine((value) => value !== 0, "Height of tree cannot be zero")
    .refine((value) => !isNaN(value), "Height of tree must be a valid number"),
  estimatedNumberOfNuts: z
    .number()
    .nonnegative("Please enter a valid number of estimated number of nuts")
    .refine((value) => value !== 0, "Estimated number of nuts cannot be zero")
    .refine(
      (value) => !isNaN(value),
      "Estimated number of nuts must be a valid number"
    ),
  numberOfTrees: z
    .number()
    .nonnegative("Please enter a valid number of trees")
    .refine((value) => value !== 0, "Number of trees cannot be zero")
    .refine((value) => !isNaN(value), "Number of trees must be a valid number"),
  quality: z
    .string()
    .min(1, "Quality is required")
    .nullable()
    .refine((val) => val !== null, "Quality is required"),
  size: z
    .string()
    .min(1, "Size is required")
    .nullable()
    .refine((val) => val !== null, "Size is required"),
  hardShellNutsPercentage: z
    .number()
    .nonnegative("Please enter a valid hard shell nuts percentage")
    .refine(
      (value) => !isNaN(value),
      "Hard shell nuts percentage must be a valid number"
    ),
  fieldCondition: z
    .string()
    .min(1, "Field condition is required")
    .nullable()
    .refine((val) => val !== null, "Field condition is required"),
  VehicleEnteringCondition: z
    .string()
    .min(1, "Vehicle entering condition is required")
    .nullable()
    .refine((val) => val !== null, "Vehicle entering condition is required"),
  isTenderCoconutFarm: z.boolean(),
  isDryCoconutFarm: z.boolean(),
  miteAttacksOrMarks: z.boolean(),
  waterPercentage: z
    .number()
    .nonnegative("Please enter a valid water percentage")
    .refine((value) => value !== 0, "Water percentage cannot be zero")
    .refine(
      (value) => !isNaN(value),
      "Water percentage must be a valid number"
    ),
  malaiPercentage: z
    .number()
    .nonnegative("Please enter a valid malai percentage")
    .refine((value) => value !== 0, "Malai percentage cannot be zero")
    .refine(
      (value) => !isNaN(value),
      "Malai percentage must be a valid number"
    ),
  shape: z
    .string()
    .min(1, "Shape is required")
    .nullable()
    .refine((val) => val !== null, "Shape is required"),
  generalHarvestCycleInDays: z
    .number()
    .nonnegative("Please enter a valid general harvest cycle in days")
    .refine(
      (value) => value !== 0,
      "General harvest cycle in days cannot be zero"
    )
    .refine(
      (value) => !isNaN(value),
      "General harvest cycle in days must be a valid number"
    ),
  chutePercentage: z
    .number()
    .nonnegative("Please enter a valid chute percentage")
    .refine(
      (value) => !isNaN(value),
      "Chute percentage must be a valid number"
    ),
  otherCropsAvailable: z.string().min(1, "Other crops available is required"),
  lastHarvestNumberOfNuts: z
    .number()
    .nonnegative("Please enter a valid last harvest number of nuts")
    .refine(
      (value) => value !== 0,
      "Last harvest number of nuts cannot be zero"
    )
    .refine(
      (value) => !isNaN(value),
      "Last harvest number of nuts must be a valid number"
    ),
  lastHarvestDate: z.string().min(1, "Last harvest date is required"),
  farmerUsesWhatsapp: z
    .string()
    .min(1, "Farmer uses WhatsApp is required")
    .nullable()
    .refine((val) => val !== null, "Farmer uses WhatsApp is required"),
});

const defaultValues = {
  qcInspector: null,
  qcDate: dayjs().format("YYYY-MM-DD"),
  readyToHarvest: dayjs().format("YYYY-MM-DD"),
  heightOfTree: 0,
  estimatedNumberOfNuts: 0,
  numberOfTrees: 0,
  quality: null,
  size: null,
  hardShellNutsPercentage: 0,
  fieldCondition: null,
  VehicleEnteringCondition: null,
  isTenderCoconutFarm: false,
  isDryCoconutFarm: false,
  miteAttacksOrMarks: false,
  waterPercentage: 0,
  malaiPercentage: 0,
  shape: null,
  generalHarvestCycleInDays: 0,
  chutePercentage: 0,
  otherCropsAvailable: "",
  lastHarvestNumberOfNuts: 0,
  lastHarvestDate: dayjs().format("YYYY-MM-DD"),
  farmerUsesWhatsapp: null,
};

const Create = ({ refetch, qcRequest, handleModalClose }) => {
  const {
    reset,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues,
    resolver: zodResolver(schema),
  });

  const [loading, setLoading] = useState(false);
  const { cx, classes } = useStyles();

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const position = await getCurrentLocation();

      const {
        qcRequestId,
        qcDate,
        readyToHarvest,
        lastHarvestDate,
        otherCropsAvailable,
        ...rest
      } = data;

      const qcRequestRef = doc(db, "qc_requests", qcRequest.id);

      await updateDoc(qcRequestRef, {
        status: "completed",
      });

      const payload = {
        ...rest,
        qcDate: dayjs(qcDate).format("YYYY-MM-DD"),
        readyToHarvest: dayjs(readyToHarvest).format("YYYY-MM-DD"),
        lastHarvestDate: dayjs(lastHarvestDate).format("YYYY-MM-DD"),
        otherCropsAvailable: otherCropsAvailable
          .split(",")
          .map((crop) => crop.trim()),
        location: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        },
        expirationDate: dayjs(qcDate).add(7, "day").format("YYYY-MM-DD"),
        id: null,
        cropId: qcRequest.cropId,
        qcRequestId: qcRequest.id,
      };

      const reference = await addDoc(collection(db, "qcs"), payload);

      const id = reference.id;

      await updateDoc(doc(db, "qcs", id), { id });

      toast.success("Quality check created successfully!");

      refetch();

      handleModalClose();
    } catch (error) {
      console.error(error);

      toast.error("error creating record : ", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container disableGutters className={cx(classes.container)}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormHeader sx={{ mt: 4 }}>QC Inspector Details</FormHeader>

        <Box className={cx(classes.inputWrapper)}>
          <Controller
            name="qcInspector"
            control={control}
            render={({ field }) => (
              <SelectInput
                {...field}
                fullWidth
                label="QC Inspector*"
                variant="outlined"
                error={!!errors.qcInspector}
                message={errors.qcInspector?.message}
              >
                {QC_INSPECTORS.map((l) => (
                  <MenuItem value={l.value}>{l.label}</MenuItem>
                ))}
              </SelectInput>
            )}
          />

          <Controller
            name="qcDate"
            control={control}
            render={({ field }) => (
              <DatePicker
                pickerProps={{
                  format: "YYYY-MM-DD",
                  label: "QC Date*",
                  sx: { width: "100%" },
                  value: dayjs(field.value),
                  onChange: (date) =>
                    field.onChange(dayjs(date).format("YYYY-MM-DD")),
                  renderInput: (params) => <TextInput {...params} />,
                }}
              />
            )}
          />
        </Box>

        <FormHeader sx={{ mt: 4 }}>Farm Details</FormHeader>

        <Box className={cx(classes.inputWrapper)}>
          <Controller
            name="isTenderCoconutFarm"
            control={control}
            render={({ field }) => (
              <SelectInput
                {...field}
                fullWidth
                label="Tender Coconut Farm*"
                variant="outlined"
                error={!!errors.isTenderCoconutFarm}
                message={errors.isTenderCoconutFarm?.message}
              >
                {YES_NO.map((l) => (
                  <MenuItem value={l.value}>{l.label}</MenuItem>
                ))}
              </SelectInput>
            )}
          />

          <Controller
            name="isDryCoconutFarm"
            control={control}
            render={({ field }) => (
              <SelectInput
                {...field}
                fullWidth
                label="Dry Coconut Farm*"
                variant="outlined"
                error={!!errors.isDryCoconutFarm}
                message={errors.isDryCoconutFarm?.message}
              >
                {YES_NO.map((l) => (
                  <MenuItem value={l.value}>{l.label}</MenuItem>
                ))}
              </SelectInput>
            )}
          />
        </Box>

        <Box className={cx(classes.inputWrapper)}>
          <Controller
            name="quality"
            control={control}
            render={({ field }) => (
              <SelectInput
                {...field}
                fullWidth
                label="Quality*"
                variant="outlined"
                error={!!errors.quality}
                message={errors.quality?.message}
              >
                {QUALITY_OPTIONS.map((l) => (
                  <MenuItem value={l.value}>{l.label}</MenuItem>
                ))}
              </SelectInput>
            )}
          />

          <Controller
            name="size"
            control={control}
            render={({ field }) => (
              <SelectInput
                {...field}
                fullWidth
                label="Size*"
                variant="outlined"
                error={!!errors.size}
                message={errors.size?.message}
              >
                {SIZE_OPTIONS.map((l) => (
                  <MenuItem value={l.value}>{l.label}</MenuItem>
                ))}
              </SelectInput>
            )}
          />
        </Box>

        <Box className={cx(classes.inputWrapper)}>
          <Controller
            name="heightOfTree"
            control={control}
            render={({ field: { onChange, ...rest } }) => (
              <TextInput
                {...rest}
                fullWidth
                type="number"
                label="Height Of Tree (in ft.)*"
                variant="outlined"
                inputProps={{
                  step: 0.1,
                }}
                error={!!errors.heightOfTree}
                helperText={errors.heightOfTree?.message}
                onChange={(e) => onChange(parseFloat(e.target.value))}
              />
            )}
          />

          <Controller
            name="estimatedNumberOfNuts"
            control={control}
            render={({ field: { onChange, ...rest } }) => (
              <TextInput
                {...rest}
                fullWidth
                type="number"
                label="Estimated Number Of Nuts*"
                variant="outlined"
                error={!!errors.estimatedNumberOfNuts}
                helperText={errors.estimatedNumberOfNuts?.message}
                onChange={(e) => onChange(parseInt(e.target.value))}
              />
            )}
          />
        </Box>

        <Box className={cx(classes.inputWrapper)}>
          <Controller
            name="numberOfTrees"
            control={control}
            render={({ field: { onChange, ...rest } }) => (
              <TextInput
                {...rest}
                fullWidth
                type="number"
                label="Number Of Trees*"
                variant="outlined"
                error={!!errors.numberOfTrees}
                helperText={errors.numberOfTrees?.message}
                onChange={(e) => onChange(parseInt(e.target.value))}
              />
            )}
          />

          <Controller
            name="hardShellNutsPercentage"
            control={control}
            render={({ field: { onChange, ...rest } }) => (
              <TextInput
                {...rest}
                fullWidth
                type="number"
                label="Hard Shell Nuts Percentage*"
                variant="outlined"
                inputProps={{
                  step: 0.1,
                }}
                error={!!errors.hardShellNutsPercentage}
                helperText={errors.hardShellNutsPercentage?.message}
                onChange={(e) => onChange(parseFloat(e.target.value))}
              />
            )}
          />
        </Box>

        <Box className={cx(classes.inputWrapper)}>
          <Controller
            name="fieldCondition"
            control={control}
            render={({ field }) => (
              <SelectInput
                {...field}
                fullWidth
                label="Field Condition*"
                variant="outlined"
                error={!!errors.fieldCondition}
                message={errors.fieldCondition?.message}
              >
                {FIELD_CONDITIONS.map((l) => (
                  <MenuItem value={l.value}>{l.label}</MenuItem>
                ))}
              </SelectInput>
            )}
          />

          <Controller
            name="VehicleEnteringCondition"
            control={control}
            render={({ field }) => (
              <SelectInput
                {...field}
                fullWidth
                label="Vehicle Entering Condition*"
                variant="outlined"
                error={!!errors.VehicleEnteringCondition}
                message={errors.VehicleEnteringCondition?.message}
              >
                {VEHICLE_ENTERING_CONDITIONS.map((l) => (
                  <MenuItem value={l.value}>{l.label}</MenuItem>
                ))}
              </SelectInput>
            )}
          />
        </Box>

        <Box className={cx(classes.inputWrapper)}>
          <Controller
            name="miteAttacksOrMarks"
            control={control}
            render={({ field }) => (
              <SelectInput
                {...field}
                fullWidth
                label="Mite Attacks or Marks*"
                variant="outlined"
                error={!!errors.miteAttacksOrMarks}
                message={errors.miteAttacksOrMarks?.message}
              >
                {YES_NO.map((l) => (
                  <MenuItem value={l.value}>{l.label}</MenuItem>
                ))}
              </SelectInput>
            )}
          />

          <Controller
            name="waterPercentage"
            control={control}
            render={({ field: { onChange, ...rest } }) => (
              <TextInput
                {...rest}
                fullWidth
                type="number"
                label="Water Percentage*"
                variant="outlined"
                inputProps={{
                  step: 0.1,
                }}
                error={!!errors.waterPercentage}
                helperText={errors.waterPercentage?.message}
                onChange={(e) => onChange(parseFloat(e.target.value))}
              />
            )}
          />
        </Box>

        <Box className={cx(classes.inputWrapper)}>
          <Controller
            name="malaiPercentage"
            control={control}
            render={({ field: { onChange, ...rest } }) => (
              <TextInput
                {...rest}
                fullWidth
                type="number"
                label="Malai Percentage*"
                variant="outlined"
                inputProps={{
                  step: 0.1,
                }}
                error={!!errors.malaiPercentage}
                helperText={errors.malaiPercentage?.message}
                onChange={(e) => onChange(parseFloat(e.target.value))}
              />
            )}
          />

          <Controller
            name="shape"
            control={control}
            render={({ field }) => (
              <SelectInput
                {...field}
                fullWidth
                label="Shape*"
                variant="outlined"
                error={!!errors.shape}
                message={errors.shape?.message}
              >
                {SHAPES.map((l) => (
                  <MenuItem value={l.value}>{l.label}</MenuItem>
                ))}
              </SelectInput>
            )}
          />
        </Box>

        <Box className={cx(classes.inputWrapper)}>
          <Controller
            name="generalHarvestCycleInDays"
            control={control}
            render={({ field: { onChange, ...rest } }) => (
              <TextInput
                {...rest}
                fullWidth
                type="number"
                label="General Harvest Cycle In Days*"
                variant="outlined"
                error={!!errors.generalHarvestCycleInDays}
                helperText={errors.generalHarvestCycleInDays?.message}
                onChange={(e) => onChange(parseInt(e.target.value))}
              />
            )}
          />

          <Controller
            name="chutePercentage"
            control={control}
            render={({ field: { onChange, ...rest } }) => (
              <TextInput
                {...rest}
                fullWidth
                type="number"
                label="Chute Percentage*"
                variant="outlined"
                inputProps={{
                  step: 0.1,
                }}
                error={!!errors.chutePercentage}
                helperText={errors.chutePercentage?.message}
                onChange={(e) => onChange(parseFloat(e.target.value))}
              />
            )}
          />
        </Box>

        <Box className={cx(classes.inputWrapper)}>
          <Controller
            name="otherCropsAvailable"
            control={control}
            render={({ field }) => (
              <TextInput
                {...field}
                fullWidth
                label="Other Crops Available*"
                variant="outlined"
                error={!!errors.otherCropsAvailable}
                helperText={
                  errors.otherCropsAvailable?.message ||
                  "Separate multiple values with commas (, )"
                }
              />
            )}
          />

          <Controller
            name="lastHarvestNumberOfNuts"
            control={control}
            render={({ field: { onChange, ...rest } }) => (
              <TextInput
                {...rest}
                fullWidth
                type="number"
                label="Last Harvest Number Of Nuts*"
                variant="outlined"
                error={!!errors.lastHarvestNumberOfNuts}
                helperText={errors.lastHarvestNumberOfNuts?.message}
                onChange={(e) => onChange(parseInt(e.target.value))}
              />
            )}
          />
        </Box>

        <Box className={cx(classes.inputWrapper)}>
          <Controller
            name="lastHarvestDate"
            control={control}
            render={({ field }) => (
              <DatePicker
                pickerProps={{
                  format: "YYYY-MM-DD",
                  label: "Last Harvest Date*",
                  sx: { width: "100%" },
                  value: dayjs(field.value),
                  onChange: (date) =>
                    field.onChange(dayjs(date).format("YYYY-MM-DD")),
                  renderInput: (params) => <TextInput {...params} />,
                }}
              />
            )}
          />
        </Box>

        <FormHeader sx={{ mt: 4 }}>Additional Details</FormHeader>

        <Box className={cx(classes.inputWrapper)}>
          <Controller
            name="farmerUsesWhatsapp"
            control={control}
            render={({ field }) => (
              <SelectInput
                {...field}
                fullWidth
                label="Farmer Uses WhatsApp*"
                variant="outlined"
                error={!!errors.farmerUsesWhatsapp}
                message={errors.farmerUsesWhatsapp?.message}
              >
                {USES_WHATSAPP_OPTIONS.map((l) => (
                  <MenuItem value={l.value}>{l.label}</MenuItem>
                ))}
              </SelectInput>
            )}
          />
        </Box>

        <FormFooter>
          <Button
            size="large"
            type="submit"
            variant="contained"
            sx={(theme) => ({ color: theme.palette.primary.white })}
          >
            Submit
          </Button>
        </FormFooter>
      </form>

      <Loader open={loading} />
    </Container>
  );
};

// 🎨 Styles
const useStyles = makeStyles({
  name: { Create },
})((theme) => ({
  container: {},
  inputWrapper: {
    gap: 12,
    display: "flex",
    [theme.breakpoints.down("sm")]: {
      gap: 0,
      flexWrap: "wrap",
    },
  },
}));

export default Create;