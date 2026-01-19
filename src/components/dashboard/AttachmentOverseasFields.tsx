import { useState } from 'react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plane, Plus, X, Building2, GraduationCap, Calendar, MapPin, Wallet, Users } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';

interface AttachmentOverseasFieldsProps {
  form: UseFormReturn<any>;
}

export function AttachmentOverseasFields({ form }: AttachmentOverseasFieldsProps) {
  const [programmeInput, setProgrammeInput] = useState('');
  
  const programmes = form.watch('attachmentProgrammes') || [];
  
  const addProgramme = () => {
    if (programmeInput.trim()) {
      const currentProgrammes = form.getValues('attachmentProgrammes') || [];
      form.setValue('attachmentProgrammes', [...currentProgrammes, programmeInput.trim()]);
      setProgrammeInput('');
    }
  };

  const removeProgramme = (index: number) => {
    const currentProgrammes = form.getValues('attachmentProgrammes') || [];
    form.setValue('attachmentProgrammes', currentProgrammes.filter((_: string, i: number) => i !== index));
  };

  return (
    <div className="space-y-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
      <div className="flex items-center gap-2 mb-4">
        <Plane className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-primary">Attachment Overseas Details</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Institution */}
        <FormField
          control={form.control}
          name="attachmentInstitution"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Institution
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ''}>
                <FormControl>
                  <SelectTrigger className="bg-input border-border/50">
                    <SelectValue placeholder="Select institution" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="PB">Politeknik Brunei (PB)</SelectItem>
                  <SelectItem value="IBTE">IBTE</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Student Count */}
        <FormField
          control={form.control}
          name="attachmentStudentCount"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Number of Students
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  {...field}
                  value={field.value || 1}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                  className="bg-input border-border/50"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Programmes */}
      <div className="space-y-2">
        <FormLabel className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4" />
          Type of Programme(s)
        </FormLabel>
        <div className="flex gap-2">
          <Input
            value={programmeInput}
            onChange={(e) => setProgrammeInput(e.target.value)}
            placeholder="Enter programme name"
            className="bg-input border-border/50"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addProgramme();
              }
            }}
          />
          <Button type="button" variant="outline" size="icon" onClick={addProgramme}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {programmes.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {programmes.map((prog: string, index: number) => (
              <Badge key={index} variant="secondary" className="pr-1">
                {prog}
                <button
                  type="button"
                  onClick={() => removeProgramme(index)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="attachmentStartDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Programme Start Date
              </FormLabel>
              <FormControl>
                <Input type="date" {...field} value={field.value || ''} className="bg-input border-border/50" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="attachmentEndDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Programme End Date
              </FormLabel>
              <FormControl>
                <Input type="date" {...field} value={field.value || ''} className="bg-input border-border/50" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Days Counter Display */}
      {form.watch('attachmentStartDate') && form.watch('attachmentEndDate') && (
        <div className="p-3 bg-secondary/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Duration: <span className="font-bold text-primary">
              {Math.ceil((new Date(form.watch('attachmentEndDate')).getTime() - new Date(form.watch('attachmentStartDate')).getTime()) / (1000 * 60 * 60 * 24))} days
            </span>
          </p>
        </div>
      )}

      {/* Funding Type */}
      <FormField
        control={form.control}
        name="attachmentFundingType"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Funding Type
            </FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ''}>
              <FormControl>
                <SelectTrigger className="bg-input border-border/50">
                  <SelectValue placeholder="Select funding type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="Self Funded">Self Funded</SelectItem>
                <SelectItem value="Organizer Funded">Organizer Funded</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Country and Destination */}
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="attachmentCountry"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Country
              </FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} placeholder="e.g. Japan, UK, Australia" className="bg-input border-border/50" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="attachmentDestination"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                University / Workplace
              </FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} placeholder="e.g. Tokyo University, Google Inc." className="bg-input border-border/50" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
