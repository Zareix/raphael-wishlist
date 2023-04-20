import {
  type ItemImage,
  type ItemLink,
  type WishlistItem,
} from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import {
  DollarSign,
  Edit,
  Euro,
  Loader2,
  Plus,
  Trash,
  Upload,
  UploadIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { ChangeEventHandler, useEffect, useRef, useState } from 'react';
import {
  Controller,
  type SubmitHandler,
  useFieldArray,
  useForm,
} from 'react-hook-form';

import AddCategory from '@/components/AddCategory';
import { Button } from '@/components/ui/button';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Input, InputError, InputGroup } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loading } from '@/components/ui/loading';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { env } from '@/env.mjs';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/utils/api';

type Inputs = Pick<
  WishlistItem,
  'name' | 'price' | 'currency' | 'categoryId'
> & {
  images: Array<Pick<ItemImage, 'image'>>;
  links: Array<Pick<ItemLink, 'link' | 'name' | 'price'>>;
};

const AddEditItem = ({
  item,
  onFinish,
}: {
  item?: Inputs & {
    id: string;
  };
  onFinish?: () => void;
}) => {
  const [isEuro, setIsEuro] = useState((item?.currency ?? 'EUR') === 'EUR');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations(item ? 'Edit' : 'Add');
  const router = useRouter();
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>({
    defaultValues: item,
  });
  const {
    fields: links,
    append: appendLink,
    remove: removeLink,
  } = useFieldArray({
    control,
    name: 'links',
  });
  const {
    fields: images,
    append: appendImage,
    remove: removeImage,
  } = useFieldArray({
    control,
    name: 'images',
  });
  const { toast } = useToast();
  const addMutation = api.wishlist.add.useMutation();
  const categoriesQuery = api.categories.getAll.useQuery();
  const imageMutation = useMutation(['image', item?.id], (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return fetch('/api/upload', {
      method: 'POST',
      body: formData,
    }).then((res) => {
      if (!res.ok) {
        throw new Error(res.statusText);
      }
      return res.json() as Promise<{ url: string }>;
    });
  });

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    addMutation
      .mutateAsync({
        ...data,
        id: item?.id,
        currency: isEuro ? 'EUR' : 'USD',
        links: data.links.map((link) => {
          return {
            ...link,
            price: isNaN(link.price ?? 0) ? undefined : link.price ?? undefined,
          };
        }),
        price: isNaN(data.price ?? 0) ? undefined : data.price ?? undefined,
      })
      .then(() => {
        router.push('/').catch(console.error);
        toast({
          title: t('toast.success'),
          description: t('toast.successDetails', {
            name: data.name,
          }),
        });
        onFinish?.();
      })
      .catch(console.error);
  };

  const uploadImage: ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    imageMutation
      .mutateAsync(file)
      .then((data) => {
        if (!data.url) return;
        appendImage({ image: data.url });
        if (fileInputRef.current) fileInputRef.current.files = null;
      })
      .catch((e: Error) => {
        toast({
          title: t('toast.errorUploadImage'),
          description: t('toast.errorUploadImageDetails', {
            message: e.message,
          }),
        });
        if (fileInputRef.current) fileInputRef.current.files = null;
      });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-6 lg:flex lg:flex-wrap lg:gap-4"
    >
      <div className=" flex flex-col items-start gap-4 lg:w-[40%]">
        <InputGroup>
          <Label>{t('form.name')}</Label>
          <Input
            placeholder={t('form.name')}
            {...register('name', { required: true })}
          />
          {errors.name && (
            <InputError>{t('form.errorFieldRequired')}</InputError>
          )}
        </InputGroup>
        <InputGroup>
          <Label>{t('form.category')}</Label>
          <div className="item-center flex gap-2">
            <Controller
              control={control}
              name="categoryId"
              defaultValue={item?.categoryId}
              rules={{ required: true }}
              render={({ field }) => (
                <>
                  <Select
                    disabled={
                      categoriesQuery.isLoading ||
                      categoriesQuery.data?.length === 0
                    }
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          categoriesQuery.isLoading ? (
                            <div className="flex items-center gap-2">
                              <Loading />
                              <span>{t('form.categoryEmpty')}</span>
                            </div>
                          ) : categoriesQuery.data?.length === 0 ? (
                            <span className="muted">
                              {t('form.categoryEmpty')}
                            </span>
                          ) : (
                            <span className="muted">
                              {t('form.categoryPlaceholder')}
                            </span>
                          )
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {categoriesQuery.data &&
                        categoriesQuery.data.map((category, index) => (
                          <React.Fragment key={category.id}>
                            <SelectGroup>
                              <SelectItem
                                value={category.id}
                                className="font-semibold text-slate-900 dark:text-slate-300"
                              >
                                {category.name}
                              </SelectItem>
                              {category.subCategories.map((subCategory) => (
                                <SelectItem
                                  value={subCategory.id}
                                  key={subCategory.id}
                                  className="ml-2"
                                >
                                  {subCategory.name}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                            {index < categoriesQuery.data.length - 1 && (
                              <SelectSeparator />
                            )}
                          </React.Fragment>
                        ))}
                    </SelectContent>
                  </Select>
                  <AddCategory
                    categories={categoriesQuery.data ?? []}
                    refetchCategories={() => {
                      categoriesQuery.refetch().catch(console.error);
                    }}
                  />
                </>
              )}
            />
          </div>
          {errors.categoryId && (
            <InputError>{t('form.errorFieldRequired')}</InputError>
          )}
        </InputGroup>
        <InputGroup>
          <Label>{t('form.price')}</Label>
          <div className="flex items-center">
            <Input
              placeholder={t('form.price')}
              type="number"
              {...register('price', {
                valueAsNumber: true,
              })}
            />
            <Button
              variant="ghost"
              type="button"
              className="px-1"
              onClick={() => setIsEuro((x) => !x)}
            >
              {isEuro ? <Euro /> : <DollarSign />}
            </Button>
          </div>
        </InputGroup>
      </div>

      <Tabs defaultValue="links" className="mt-4 w-full lg:ml-auto lg:w-1/2">
        <TabsList>
          <TabsTrigger value="links">{t('form.links')}</TabsTrigger>
          <TabsTrigger value="images">{t('form.images')}</TabsTrigger>
        </TabsList>
        <TabsContent value="links" className="px-3">
          <div className="flex flex-col gap-4">
            {links.map((field, index) => {
              return (
                <div key={field.id} className="flex flex-wrap">
                  <div className="grid w-[85%] grid-cols-3 gap-1">
                    <Input
                      placeholder={t('form.linkName')}
                      className="col-span-2"
                      {...register(`links.${index}.name`)}
                    />
                    <Input
                      placeholder={t('form.linkPrice')}
                      type="number"
                      {...register(`links.${index}.price`, {
                        valueAsNumber: true,
                      })}
                    />
                    <Input
                      placeholder={t('form.linkUrl')}
                      className="col-span-3"
                      {...register(`links.${index}.link`, {
                        required: true,
                      })}
                    />
                  </div>
                  <Button
                    variant="destructive"
                    className="m-auto w-[12%] p-1"
                    type="button"
                    onClick={() => {
                      removeLink(index);
                    }}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                  {errors.links?.[index]?.link && (
                    <InputError className="w-full">
                      {t('form.errorFieldRequired')}
                    </InputError>
                  )}
                </div>
              );
            })}
            <Button
              variant="outline"
              type="button"
              className="ml-auto"
              onClick={() =>
                appendLink({
                  link: '',
                  name: '',
                  price: NaN,
                })
              }
            >
              <Plus className="mr-2 h-6 w-6" />
              {t('form.linkAdd')}
            </Button>
          </div>
        </TabsContent>
        <TabsContent value="images" className="px-3">
          <div className="flex flex-col gap-2">
            {images.map((field, index) => {
              return (
                <div key={field.id} className="flex flex-wrap">
                  <HoverCard openDelay={0} closeDelay={0}>
                    <HoverCardTrigger asChild>
                      <Input
                        placeholder={t('form.imageURL')}
                        className="w-[85%]"
                        {...register(`images.${index}.image`, {
                          required: true,
                        })}
                      />
                    </HoverCardTrigger>
                    {watch(`images.${index}.image`) && (
                      <HoverCardContent side="top">
                        <ItemImageCard image={watch(`images.${index}.image`)} />
                      </HoverCardContent>
                    )}
                  </HoverCard>
                  <Button
                    variant="destructive"
                    className="m-auto w-[12%] p-1"
                    type="button"
                    onClick={() => {
                      removeImage(index);
                    }}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                  {errors.images?.[index]?.image && (
                    <InputError className="w-full">
                      {t('form.errorFieldRequired')}
                    </InputError>
                  )}
                </div>
              );
            })}
            <div className="flex justify-end gap-2">
              <input
                ref={fileInputRef}
                type="file"
                hidden
                onChange={uploadImage}
              />
              <Button
                variant="outline"
                type="button"
                className="ml-auto"
                onClick={() => {
                  fileInputRef.current?.click();
                }}
              >
                {imageMutation.isLoading ? (
                  <Loading />
                ) : (
                  <UploadIcon className="h-6 w-6" />
                )}
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={() =>
                  appendImage(
                    {
                      image: '',
                    },
                    {
                      shouldFocus: false,
                    },
                  )
                }
              >
                <Plus className="mr-2 h-6 w-6" />
                {t('form.imageAdd')}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Button
        disabled={addMutation.isLoading}
        type="submit"
        className="ml-auto mt-4"
      >
        {addMutation.isLoading ? (
          <Loader2 className="mr-2 h-6 w-6 animate-spin" />
        ) : item ? (
          <Edit className="mr-2 h-6 w-6" />
        ) : (
          <Plus className="mr-2 h-6 w-6" />
        )}
        {item ? t('form.submitEdit') : t('form.submitAdd')}
      </Button>
    </form>
  );
};

const ItemImageCard = ({ image }: { image: string }) => {
  const [error, setError] = useState(false);
  const t = useTranslations('Add');

  useEffect(() => {
    setError(false);
  }, [image]);

  if (error) return <InputError>{t('form.imageLoadingError')}</InputError>;

  try {
    if (
      new URL(image).hostname ===
      new URL(env.NEXT_PUBLIC_S3_PUBLIC_URL).hostname
    )
      return (
        <div className="h-full">
          <Image
            src={image}
            alt="Preview"
            fill
            sizes="250px"
            className="!relative mx-auto max-h-32 !w-auto rounded-sm object-contain"
          />
        </div>
      );
  } catch (_e) {}

  return (
    <div>
      {/* eslint-disable-next-line @next/next/no-img-element*/}
      <img
        src={image}
        alt="Preview"
        className="mx-auto h-full max-h-32 rounded-sm object-contain"
        onError={() => {
          setError(true);
        }}
      />
    </div>
  );
};

export default AddEditItem;
