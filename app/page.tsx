
/* eslint-disable react/no-unescaped-entities */

"use client"

import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { 
  Button, 
  Label, 
  TextInput, 
  Textarea, 
  Checkbox, 
  Select,
  Radio,
  FileInput,
  Alert,
  Card
} from 'flowbite-react'
import { ChangeEvent } from 'react';

const MAX_FILE_SIZE = Number.MAX_SAFE_INTEGER;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/heic"];

const formSchema = z.object({
  clientName: z.string().min(2, { message: "Client name must be at least 2 characters." }),
  datePerformed: z.string(),
  invoiceNumber: z.string(),
  orderType: z.string(),
  inspector: z.string().min(1, { message: "Please select an inspector." }),
  lotNumbers: z.string(),
  preparedBy: z.string(),
  packingSlip: z.array(z.string()),
  cofAs: z.array(z.string()),
  inspectProducts: z.array(z.string()),
  billOfLading: z.array(z.string()),
  mistakes: z.string(),
  actionTaken: z.string().optional(),
  comments: z.string().optional(),
  attachments: z
    .any()
    .refine((files: FileList | undefined) => files && files.length > 0, "Image is required.")
    .refine(
      (files: FileList | undefined) => files && ACCEPTED_IMAGE_TYPES.includes(files[0]?.type || ''),
      "Only .jpg, .jpeg, .png, .webp, and .heic formats are supported."
    ),
})

type FormData = z.infer<typeof formSchema>

function getCheckboxOptions(fieldName: string): string[] {
  switch (fieldName) {
    case 'packingSlip':
      return ['Ship to', 'Ship Via', 'Ship Date', 'P.O. Number', 'Signature Label', 'Freight'];
    case 'cofAs':
      return ['Match', 'No C of As needed', 'Freight'];
    case 'inspectProducts':
      return ['Check Label Information', 'Lid', 'GHS Labels'];
    case 'billOfLading':
      return ['"Ship to" Address', 'Pallet Count', 'Package Quantity', 'Type', 'Weight', 'H.M.', 'Commodity Description', 'Signature'];
    default:
      return [];
  }
}



interface SearchResult {
  id: string;
  clientName: string;
  invoiceNumber: string;
  lotNumbers: string;
  datePerformed: string;
  orderType: string;
  inspector: string;
  preparedBy: string;
  packingSlip: string;
  cofAs: string;
  inspectProducts: string;
  billOfLading: string;
  mistakes: string;
  actionTaken?: string;
  comments?: string;
  attachmentUrl?: string;
}

// ... existing imports ...

// Add this interface to define the shape of a search result
interface SearchResult {
  id: string;
  clientName: string;
  invoiceNumber: string;
  lotNumbers: string;
  datePerformed: string;
  orderType: string;
  inspector: string;
  preparedBy: string;
  packingSlip: string;
  cofAs: string;
  inspectProducts: string;
  billOfLading: string;
  mistakes: string;
  actionTaken?: string;
  comments?: string;
  attachmentUrl?: string;
}

interface FormInputs {
  clientName: string;
  datePerformed: string;
  invoiceNumber: string;
  orderType: string;
  inspector: string;
  lotNumbers: string;
  preparedBy: string;
  packingSlip: string[];
  cofAs: string[];
  inspectProducts: string[];
  billOfLading: string[];
  mistakes: string;
  actionTaken?: string;
  comments?: string;
  attachments: FileList;
}

export default function QualityControlForm() {
  const { control, handleSubmit, watch, reset } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: "",
      datePerformed: "",
      invoiceNumber: "",
      orderType: "",
      inspector: "",
      lotNumbers: "",
      preparedBy: "",
      packingSlip: [],
      cofAs: [],
      inspectProducts: [],
      billOfLading: [],
      mistakes: "",
      actionTaken: "",
      comments: "",
    }
  })

  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [selectedResult, setSelectedResult] = useState<string | null>(null);

  const mistakes = watch('mistakes')

  const onSubmit = async (data: FormData) => {
    setSubmitStatus('loading');
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'attachments') {
          if (value && value.length > 0) {
            formData.append(key, value[0]);
          }
        } else if (Array.isArray(value)) {
          value.forEach(item => formData.append(key, item));
        } else {
          formData.append(key, value as string);
        }
      });

      const response = await fetch('/api/submit-form', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      const result = await response.json();
      console.log(result.message);
      setSubmitStatus('success');
      reset();
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchError('Please enter a search term');
      return;
    }

    setIsSearching(true);
    setSearchError('');
    setSearchResults([]);

    try {
      const response = await fetch(`/api/submit-form?search=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) {
        throw new Error('Failed to search orders');
      }
      const data = await response.json();
      console.log('Search results:', data);
      setSearchResults(data.results as SearchResult[]);
      if (data.results.length === 0) {
        setSearchError('No results found');
      }
    } catch (error) {
      console.error('Error searching orders:', error);
      setSearchError('An error occurred while searching. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleDownload = async (objectKey: string) => {
    try {
      const response = await fetch(`/api/submit-form?key=${encodeURIComponent(objectKey)}`);
      if (!response.ok) {
        throw new Error('Failed to get download URL');
      }
      const data = await response.json();
      window.open(data.signedUrl, '_blank');
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const handleCardClose = () => {
    setSelectedResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto my-8 p-4 sm:p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
        Warehouse Outgoing Product Checklist
      </h2>
      
      {/* Search Section */}
      <div className="mb-6">
        <Label htmlFor="search" className="mb-2 block">Search Orders</Label>
        <div className="flex">
          <TextInput
            id="search"
            type="text"
            placeholder="Search by client name, invoice number, or lot numbers"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow"
          />
          <Button
            type="submit"
            className="ml-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Search
          </Button>
        </div>
        {searchError && <p className="mt-2 text-sm text-red-600">{searchError}</p>}
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-4">Search Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {searchResults.map((result: SearchResult) => (
              <Card key={result.id} className="relative">
                <button
                  onClick={() => setSelectedResult(selectedResult === result.id ? null : result.id)}
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  ✕
                </button>
                {selectedResult === result.id && (
                  <>
                    <h5 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
                      {result.clientName || 'N/A'}
                    </h5>
                    <p className="font-normal text-gray-700 dark:text-gray-400">
                      Invoice: {result.invoiceNumber || 'N/A'}
                    </p>
                    <p className="font-normal text-gray-700 dark:text-gray-400">
                      Lot Numbers: {result.lotNumbers || 'N/A'}
                    </p>
                    <p className="font-normal text-gray-700 dark:text-gray-400">
                      Date: {result.datePerformed ? new Date(result.datePerformed).toLocaleDateString() : 'N/A'}
                    </p>
                    <p className="font-normal text-gray-700 dark:text-gray-400">
                      Order Type: {result.orderType || 'N/A'}
                    </p>
                    <p className="font-normal text-gray-700 dark:text-gray-400">
                      Inspector: {result.inspector || 'N/A'}
                    </p>
                    <p className="font-normal text-gray-700 dark:text-gray-400">
                      Prepared By: {result.preparedBy || 'N/A'}
                    </p>
                    <p className="font-normal text-gray-700 dark:text-gray-400">
                      Packing Slip: {result.packingSlip || 'N/A'}
                    </p>
                    <p className="font-normal text-gray-700 dark:text-gray-400">
                      C of A's: {result.cofAs || 'N/A'}
                    </p>
                    <p className="font-normal text-gray-700 dark:text-gray-400">
                      Inspect Products: {result.inspectProducts || 'N/A'}
                    </p>
                    <p className="font-normal text-gray-700 dark:text-gray-400">
                      Bill of Lading: {result.billOfLading || 'N/A'}
                    </p>
                    <p className="font-normal text-gray-700 dark:text-gray-400">
                      Mistakes: {result.mistakes || 'N/A'}
                    </p>
                    {result.mistakes === 'Yes' && (
                      <p className="font-normal text-gray-700 dark:text-gray-400">
                        Action Taken: {result.actionTaken || 'N/A'}
                      </p>
                    )}
                    {result.comments && (
                      <p className="font-normal text-gray-700 dark:text-gray-400">
                        Comments: {result.comments}
                      </p>
                    )}
                    {result.attachmentUrl && (
                      <Button onClick={() => handleDownload(result.attachmentUrl || '')} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                        Download Attachment
                      </Button>
                    )}
                  </>
                )}
                {selectedResult !== result.id && (
                  <Button onClick={() => setSelectedResult(result.id)} className="bg-blue-600 hover:bg-blue-700 text-white">
                    View Details
                  </Button>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <FormField
            control={control}
            name="clientName"
            label="Client Name"
            component={TextInput}
          />
          <FormField
            control={control}
            name="datePerformed"
            label="Date Performed"
            component={TextInput}
            type="date"
          />
          <FormField
            control={control}
            name="invoiceNumber"
            label="Invoice Number"
            component={TextInput}
          />
          <FormField
            control={control}
            name="orderType"
            label="Order Type"
            component={Select}
          >
            <option value="">Select order type</option>
            <option value="type1">Type 1</option>
            <option value="type2">Type 2</option>
            <option value="type3">Type 3</option>
          </FormField>
          <FormField
            control={control}
            name="inspector"
            label="Inspector"
            component={Select}
          >
            <option value="">Select inspector</option>
            <option value="Cruz G.">Cruz G.</option>
            <option value="Other">Other</option>
          </FormField>
          <FormField
            control={control}
            name="lotNumbers"
            label="Lot Number(s)"
            component={TextInput}
          />
        </div>

        <FormField
          control={control}
          name="preparedBy"
          label="Prepared By"
          component={RadioGroup}
          options={['Wayne', 'Andy', 'Oscar', 'Other']}
        />

        {['packingSlip', 'cofAs', 'inspectProducts', 'billOfLading'].map((fieldName) => (
          <FormField
            key={fieldName}
            control={control}
            name={fieldName as keyof FormData}
            label={fieldName === 'cofAs' ? "C of A's" : fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            component={CheckboxGroup}
            options={getCheckboxOptions(fieldName)}
          />
        ))}

        <FormField
          control={control}
          name="mistakes"
          label="Mistakes"
          component={RadioGroup}
          options={['Yes', 'No']}
        />

        {mistakes === 'Yes' && (
          <FormField
            control={control}
            name="actionTaken"
            label="Action Taken (Mistakes)"
            component={Textarea}
          />
        )}

        <FormField
          control={control}
          name="comments"
          label="Additional Comments"
          component={Textarea}
        />

        <FormField
          control={control}
          name="attachments"
          label="Attachments"
          component={FileInput}
          helperText="Take a picture or upload an image"
          accept="image/*"
          capture="environment"
        />

        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          disabled={submitStatus === 'loading'}
        >
          {submitStatus === 'loading' ? 'Submitting...' : 'Submit'}
        </Button>

        {submitStatus === 'success' && (
          <Alert color="success">
            Form submitted successfully!
          </Alert>
        )}

        {submitStatus === 'error' && (
          <Alert color="failure">
            An error occurred while submitting the form. Please try again.
          </Alert>
        )}
      </form>
    </div>
  )
}

function FormField({ control, name, label, component: Component, options, ...props }: any) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }: { field: any; fieldState: { error?: any } }) => (
        <div>
          <Label htmlFor={name} className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">{label}</Label>
          {Component === RadioGroup || Component === CheckboxGroup ? (
            <Component 
              field={field}
              options={options}
              {...props}
            />
          ) : Component === Select ? (
            <Component 
              id={name}
              {...field}
              {...props}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
              {props.children}
            </Component>
          ) : Component === FileInput ? (
            <Component 
              id={name}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                field.onChange(e.target.files);
              }}
              {...props}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />
          ) : (
            <Component 
              id={name}
              {...field}
              {...props}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />
          )}
          {fieldState.error && <p className="mt-2 text-sm text-red-600 dark:text-red-500">{fieldState.error.message}</p>}
        </div>
      )}
    />
  )
}

function RadioGroup({ field, options }: { field: any; options: string[] }) {
  return (
    <div className="flex flex-wrap gap-4">
      {options.map((option: string) => (
        <div key={option} className="flex items-center">
          <Radio
            id={`${field.name}-${option}`}
            {...field}
            value={option}
            checked={field.value === option}
            onChange={() => field.onChange(option)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <Label htmlFor={`${field.name}-${option}`} className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">{option}</Label>
        </div>
      ))}
    </div>
  )
}

function CheckboxGroup({ field, options }: { field: any; options: string[] }) {
  return (
    <div className="flex flex-wrap gap-4">
      {options.map((option: string) => (
        <div key={option} className="flex items-center">
          <Checkbox
            id={`${field.name}-${option}`}
            checked={field.value?.includes(option)}
            onChange={(e) => {
              const updatedValue = e.target.checked
                ? [...(field.value || []), option]
                : (field.value || []).filter((i: string) => i !== option);
              field.onChange(updatedValue);
            }}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <Label htmlFor={`${field.name}-${option}`} className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">{option}</Label>
        </div>
      ))}
    </div>
  );
}