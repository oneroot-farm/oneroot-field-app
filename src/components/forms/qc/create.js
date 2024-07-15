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
import { doc, getDoc, addDoc, updateDoc, collection } from "firebase/firestore";

// Components
import Loader from "@/components/loader";
import DocPicker from "@/components/docPicker";
import DatePicker from "@/components/datePicker";
import FormHeader from "@/components/forms/components/formHeader";
import FormFooter from "@/components/forms/components/formFooter";

// Inputs
import TextInput from "@/components/inputs/textInput";
import SelectInput from "@/components/inputs/selectInput";

// Utils
import {
  getCurrentLocation,
  areCoordinates,
  uploadFilesHandler,
} from "@/utils";

// Constants
import {
  SHAPES,
  YES_NO,
  CROPS,
  SIZE_OPTIONS,
  QC_INSPECTORS,
  QUALITY_OPTIONS,
  FIELD_CONDITIONS,
  IPM_ORGANIC_TYPES,
  TURMERIC_VARIETIES,
  USES_WHATSAPP_OPTIONS,
  TURMERIC_POLISHED_TYPES,
  VEHICLE_ENTERING_CONDITIONS,
} from "@/constants";

const schema = z.object({
  qcInspector: z
    .string()
    .nullable()
    .refine((val) => val !== "", "QC Inspector is required"),

  qcDate: z.string().min(1, "QC Date is required"),

  readyToHarvestDate: z.string().min(1, "Ready to Harvest date is required"),

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

  quality: z.string().nullable(),
  /* .refine((val) => val !== "", "Quality is required"), */

  size: z.string().nullable(),
  /* .refine((val) => val !== "", "Size is required"), */

  hardShellNutsPercentage: z
    .number()
    .nonnegative("Please enter a valid hard shell nuts percentage")
    .refine(
      (value) => !isNaN(value),
      "Hard shell nuts percentage must be a valid number"
    ),

  fieldCondition: z
    .string()
    .nullable()
    .refine((val) => val !== "", "Field condition is required"),

  VehicleEnteringCondition: z
    .string()
    .nullable()
    .refine((val) => val !== "", "Vehicle entering condition is required"),

  isTenderCoconutFarm: z.boolean(),

  isDryCoconutFarm: z.boolean(),

  miteAttacksOrMarks: z.boolean(),

  waterPercentage: z
    .number()
    .nonnegative("Please enter a valid water percentage")
    /* .refine((value) => value !== 0, "Water percentage cannot be zero") */
    .refine(
      (value) => !isNaN(value),
      "Water percentage must be a valid number"
    ),

  malaiPercentage: z
    .number()
    .nonnegative("Please enter a valid malai percentage")
    /* .refine((value) => value !== 0, "Malai percentage cannot be zero") */
    .refine(
      (value) => !isNaN(value),
      "Malai percentage must be a valid number"
    ),

  shape: z.string().nullable(),
  /* .refine((val) => val !== "", "Shape is required"), */

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

  otherCropsAvailable: z.array(z.string()),

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
    .nullable()
    .refine((val) => val !== "", "Farmer uses WhatsApp is required"),

  numberOfAcres: z.number().nonnegative("Please enter a valid number of acres"),
  /* .refine((value) => value !== 0, "Number of acres can not be zero") */
  /* .refine((value) => !isNaN(value), "Number of acres must be a valid number"), */

  turmericVariety: z.string().nullable(),
  /* .refine((value) => value !== "", "Variety is required"), */

  polishedType: z.string().nullable(),
  /* .refine((value) => value !== "", "Polished type is required"), */

  ipmOrOrganic: z.string().nullable(),
  /* .refine((value) => value !== "", "IPM Or Oraganic is required"), */

  coords: z.string().optional(),

  notes: z.string().optional(),
});

const defaultValues = {
  qcInspector: "",
  qcDate: dayjs().format("YYYY-MM-DD"),
  readyToHarvestDate: dayjs().format("YYYY-MM-DD"),
  heightOfTree: 0,
  estimatedNumberOfNuts: 0,
  numberOfTrees: 0,
  quality: "",
  size: "",
  hardShellNutsPercentage: 0,
  fieldCondition: "",
  VehicleEnteringCondition: "",
  isTenderCoconutFarm: false,
  isDryCoconutFarm: false,
  miteAttacksOrMarks: false,
  waterPercentage: 0,
  malaiPercentage: 0,
  shape: "",
  generalHarvestCycleInDays: 0,
  chutePercentage: 0,
  otherCropsAvailable: [],
  numberOfAcres: 0,
  turmericVariety: "",
  polishedType: "",
  ipmOrOrganic: "",
  lastHarvestNumberOfNuts: 0,
  lastHarvestDate: dayjs().format("YYYY-MM-DD"),
  farmerUsesWhatsapp: "",
  coords: "",
  notes: "",
};

const Create = ({ refetch, fields, handleModalClose }) => {
  const {
    watch,
    control,
    setError,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues,
    resolver: zodResolver(schema),
  });

  const { cx, classes } = useStyles();

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (files) => {
    setFiles(files);
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const {
        qcDate,
        lastHarvestDate,
        readyToHarvestDate,
        otherCropsAvailable,
        numberOfAcres,
        turmericVariety,
        polishedType,
        ipmOrOrganic,
        coords,
      } = data;

      if (otherCropsAvailable.includes("Turmeric")) {
        let valid = true;

        if (numberOfAcres === 0 || isNaN(numberOfAcres)) {
          setError("numberOfAcres", {
            type: "manual",
            message:
              "Number of acres can not be zero and must be a valid number",
          });

          valid = false;
        }

        if (!turmericVariety || turmericVariety === "") {
          setError("turmericVariety", {
            type: "manual",
            message: "Variety is required",
          });

          valid = false;
        }

        if (!polishedType || polishedType === "") {
          setError("polishedType", {
            type: "manual",
            message: "Polished type is required",
          });

          valid = false;
        }

        if (!ipmOrOrganic || ipmOrOrganic === "") {
          setError("ipmOrOrganic", {
            type: "manual",
            message: "IPM Or Organic is required",
          });

          valid = false;
        }

        if (!valid) return;
      }

      if (coords) {
        const point = /^\s*-?\d+\.\d+\s*,\s*-?\d+\.\d+\s*$/;

        if (!point.test(coords) && !areCoordinates(coords)) {
          setError("coords", {
            type: "manual",
            message: "Coordinates must be in 'latitude, longitude' format",
          });

          return;
        }
      }

      const qcRequestRef = doc(db, "qc_requests", fields.id);

      await updateDoc(qcRequestRef, {
        status: "completed",
      });

      const { notes, coords: coordinates, ...rest } = data;

      const timestamp = dayjs().format("YYYY-MM-DD HH:mm:ss");

      const payload = {
        ...rest,
        cropId: fields.cropId,
        qcRequestId: fields.id,
        cropsAvailable: otherCropsAvailable,
        qcDate: dayjs(qcDate).format("YYYY-MM-DD"),
        lastHarvestDate: dayjs(lastHarvestDate).format("YYYY-MM-DD"),
        readyToHarvestDate: dayjs(readyToHarvestDate).format("YYYY-MM-DD"),
        expirationDate: dayjs(qcDate).add(7, "day").format("YYYY-MM-DD"),
      };

      let tags = fields?.tags ? [...fields.tags] : [];

      if (coords && areCoordinates(coords)) {
        const [lat, lng] = coords.split(",");

        payload.location = {
          latitude: parseFloat(lat),
          longitude: parseFloat(lng),
        };

        if (fields && fields?.tags) {
          tags = tags.filter((t) => t !== "need-location");
        }
      } else {
        const position = await getCurrentLocation();

        payload.location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
      }

      if (files && files.length > 0) {
        const images = Array.from(files);

        const urls = await uploadFilesHandler(images, "qc-images");

        payload.images = urls;
      } else {
        payload.images = [];
      }

      payload.tags = tags;

      const reference = await addDoc(collection(db, "qcs"), payload);

      const id = reference.id;

      await updateDoc(doc(db, "qcs", id), { id });

      const cropRef = doc(db, "crops", fields.cropId);

      const crop = await getDoc(cropRef);

      if (crop.exists()) {
        const data = crop.data();

        const existingNotes = data.notes || [];

        const newNotes = notes
          ? notes.split(",").map((note) => `${timestamp} - ${note.trim()}`)
          : [];

        await updateDoc(cropRef, {
          notes: [...existingNotes, ...newNotes],
        });
      } else {
        console.error("crop record not found");
      }

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

  const crops = watch("otherCropsAvailable");

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

        <DocPicker
          sx={{ mb: 2.5 }}
          files={files}
          handleFileUpload={handleFileUpload}
        />

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
                label="Quality"
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
                label="Size"
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
                label="Hard Shell Nuts Percentage"
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
                label="Mite Attacks or Marks"
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
                label="Water Percentage"
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
                label="Malai Percentage"
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
                label="Shape"
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
            name="readyToHarvestDate"
            control={control}
            render={({ field }) => (
              <DatePicker
                pickerProps={{
                  format: "YYYY-MM-DD",
                  label: "Ready To Harvest Date*",
                  sx: { width: "100%" },
                  value: dayjs(field.value),
                  onChange: (date) =>
                    field.onChange(dayjs(date).format("YYYY-MM-DD")),
                  renderInput: (params) => <TextInput {...params} />,
                }}
              />
            )}
          />

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

        <Box className={cx(classes.inputWrapper)}>
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

          <Controller
            name="otherCropsAvailable"
            control={control}
            render={({ field }) => (
              <SelectInput
                {...field}
                multiple
                fullWidth
                label="Crops Available"
                variant="outlined"
                error={!!errors.otherCropsAvailable}
                message={errors.otherCropsAvailable?.message}
              >
                {CROPS.map((l) => (
                  <MenuItem value={l.value}>{l.label}</MenuItem>
                ))}
              </SelectInput>
            )}
          />
        </Box>

        {crops.includes("Turmeric") && (
          <>
            <FormHeader sx={{ mt: 4 }}>Turmeric Details</FormHeader>

            <Box className={cx(classes.inputWrapper)}>
              <Controller
                name="turmericVariety"
                control={control}
                render={({ field }) => (
                  <SelectInput
                    {...field}
                    fullWidth
                    label="Variety*"
                    variant="outlined"
                    error={!!errors.turmericVariety}
                    message={errors.turmericVariety?.message}
                  >
                    {TURMERIC_VARIETIES.map((l) => (
                      <MenuItem value={l.value}>{l.label}</MenuItem>
                    ))}
                  </SelectInput>
                )}
              />

              <Controller
                name="numberOfAcres"
                control={control}
                render={({ field: { onChange, ...rest } }) => (
                  <TextInput
                    {...rest}
                    fullWidth
                    type="number"
                    label="Number Of Acres*"
                    variant="outlined"
                    inputProps={{
                      step: 0.1,
                    }}
                    error={!!errors.numberOfAcres}
                    helperText={errors.numberOfAcres?.message}
                    onChange={(e) => onChange(parseFloat(e.target.value))}
                  />
                )}
              />
            </Box>

            <Box className={cx(classes.inputWrapper)}>
              <Controller
                name="polishedType"
                control={control}
                render={({ field }) => (
                  <SelectInput
                    {...field}
                    fullWidth
                    label="Polished Type*"
                    variant="outlined"
                    error={!!errors.polishedType}
                    message={errors.polishedType?.message}
                  >
                    {TURMERIC_POLISHED_TYPES.map((l) => (
                      <MenuItem value={l.value}>{l.label}</MenuItem>
                    ))}
                  </SelectInput>
                )}
              />

              <Controller
                name="ipmOrOrganic"
                control={control}
                render={({ field }) => (
                  <SelectInput
                    {...field}
                    fullWidth
                    label="IPM Or Oraganic*"
                    variant="outlined"
                    error={!!errors.ipmOrOrganic}
                    message={errors.ipmOrOrganic?.message}
                  >
                    {IPM_ORGANIC_TYPES.map((l) => (
                      <MenuItem value={l.value}>{l.label}</MenuItem>
                    ))}
                  </SelectInput>
                )}
              />
            </Box>
          </>
        )}

        <FormHeader sx={{ mt: 4 }}>Additional Details</FormHeader>

        <Box className={cx(classes.inputWrapper)}>
          <Controller
            name="coords"
            control={control}
            render={({ field }) => (
              <TextInput
                {...field}
                fullWidth
                label="Coordinates"
                variant="outlined"
                error={!!errors.coords}
                helperText={
                  errors.coords?.message ||
                  "Captures current location if not provided"
                }
              />
            )}
          />

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

        <Box className={cx(classes.inputWrapper)}>
          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <TextInput
                {...field}
                fullWidth
                label="Notes"
                variant="outlined"
                error={!!errors.notes}
                helperText={
                  errors.notes?.message ||
                  "Separate multiple values with commas (,)"
                }
              />
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
