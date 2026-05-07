from __future__ import annotations
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.product import Category, Product
from app.models.user import User
from app.schemas.product import CategoryCreate, CategoryOut, ProductCreate, ProductOut, ProductUpdate, StockUpdate
from app.utils.cloudinary import upload_image
from app.utils.deps import get_current_admin

router = APIRouter(prefix="/products", tags=["products"])


@router.get("/categories", response_model=list[CategoryOut])
async def list_categories(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Category).where(Category.is_active == True))
    return result.scalars().all()


@router.post("/categories", response_model=CategoryOut, status_code=201)
async def create_category(body: CategoryCreate, _: User = Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    cat = Category(**body.model_dump())
    db.add(cat)
    await db.commit()
    await db.refresh(cat)
    return cat


@router.get("", response_model=list[ProductOut])
async def list_products(
    category_id: uuid.UUID | None = Query(None),
    search: str | None = Query(None),
    min_price: float | None = Query(None),
    max_price: float | None = Query(None),
    in_stock: bool | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    q = select(Product).options(selectinload(Product.category)).where(Product.is_active == True)
    if category_id:
        q = q.where(Product.category_id == category_id)
    if search:
        q = q.where(Product.name.ilike(f"%{search}%"))
    if min_price is not None:
        q = q.where(Product.price_per_unit >= min_price)
    if max_price is not None:
        q = q.where(Product.price_per_unit <= max_price)
    if in_stock:
        q = q.where(Product.stock_quantity > 0)
    result = await db.execute(q)
    return result.scalars().all()


@router.get("/{product_id}", response_model=ProductOut)
async def get_product(product_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Product).options(selectinload(Product.category)).where(Product.id == product_id)
    )
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("", response_model=ProductOut, status_code=201)
async def create_product(body: ProductCreate, _: User = Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    product = Product(**body.model_dump())
    db.add(product)
    await db.commit()
    result = await db.execute(
        select(Product).options(selectinload(Product.category)).where(Product.id == product.id)
    )
    return result.scalar_one()


@router.patch("/{product_id}", response_model=ProductOut)
async def update_product(product_id: uuid.UUID, body: ProductUpdate, _: User = Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product).options(selectinload(Product.category)).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(product, field, value)
    await db.commit()
    await db.refresh(product)
    return product


@router.patch("/{product_id}/stock", response_model=ProductOut)
async def update_stock(product_id: uuid.UUID, body: StockUpdate, _: User = Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product).options(selectinload(Product.category)).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product.stock_quantity = body.stock_quantity
    await db.commit()
    await db.refresh(product)
    return product


@router.post("/{product_id}/image", response_model=ProductOut)
async def upload_product_image(product_id: uuid.UUID, file: UploadFile = File(...), _: User = Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product).options(selectinload(Product.category)).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    image_bytes = await file.read()
    product.image_url = await upload_image(image_bytes, folder="agrowood/products")
    await db.commit()
    await db.refresh(product)
    return product
