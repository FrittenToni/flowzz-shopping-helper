// src/lib/syncStrains.ts

interface ImageFormats {
    small: {
        url: string;
    };
    thumbnail: {
        url: string;
    };
}

interface ImageAttributes {
    alternative_text: string;
    width: number;
    height: number;
    mime: string;
    url: string;
    formats: ImageFormats;
}

interface ImageData {
    data: {
        id: number;
        attributes: ImageAttributes;
    };
}

interface Product {
    id: number;
    url: string;
    producer: string | null;
    name: string;
    thc: number;
    cbd: number;
    genetic: string;
    irradiated: boolean;
    origin: string;
    created_at: string;
    updated_at: string;
    published_at: string;
    created_by_id: number;
    updated_by_id: number;
    locale: string;
    description: string | null;
    strain_name: string;
    producer_name: string;
    ratings_score: number;
    ratings_count: number;
    min_price: number;
    max_price: number;
    availibility: number;
    image: ImageData | null;
}

interface Pagination {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
}

interface ApiResponse {
    message: {
        data: Product[];
        meta: {
            pagination: Pagination;
        };
    };
    error: boolean;
}

interface Vendor {
    id: string;
    attributes: {
        price: number;
        availibility: number;
        url: string | null;
        vendor: {
            data: {
                id: string;
                attributes: {
                    name: string;
                    website: string;
                    cannaleo_partner: string | null;
                };
            };
        };
    };
}

interface VendorApiResponse {
    message: {
        data: {
            priceFlowers: {
                data: Vendor[];
            };
            lastPriceUpdate: string;
        };
    };
    error: boolean;
}

export async function fetchStrains(updateMessage: (message: string) => void): Promise<void> {
    let allStrains: Product[] = [];
    let page = 1;
    const pageSize = 12; // The pageSize should match the one used by the API
    let hasMore = true;

    updateMessage('Syncing Cannabis Strains...');

    while (hasMore) {
        try {
            const response = await fetch(`https://flowzz.com/api/products?pagination[page]=${page}&pagination[pageSize]=${pageSize}`);
            const data: ApiResponse = await response.json();

            if (data.error) {
                throw new Error('API error');
            }

            if (data.message && data.message.data && data.message.data.length > 0) {
                allStrains = [...allStrains, ...data.message.data];
                page++;
                const pagination = data.message.meta.pagination;
                hasMore = pagination.page < pagination.pageCount;
            } else {
                hasMore = false;
            }
        } catch (error) {
            console.error('Error fetching cannabis strains:', error);
            updateMessage('Failed to retrieve cannabis strains.');
            return;
        }
    }

    localStorage.setItem('cannabisStrains', JSON.stringify(allStrains));
    updateMessage(`${allStrains.length} Cannabis Strains available`);
}

export async function fetchVendorsForStrain(csrfToken: string, strainId: number): Promise<VendorApiResponse | null> {
    try {
        const response = await fetch('https://flowzz.com/api/vendor', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Xsrf-Token': csrfToken
            },
            body: JSON.stringify({ t: 2, id: strainId })
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: VendorApiResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

export async function fetchCsrfToken(strainId: number): Promise<VendorApiResponse | null> {
    try {
        const response = await fetch('https://flowzz.com/api/auth/csrf');
        const data = await response.json();
        if (data.csrfToken) {
            return await fetchVendorsForStrain(data.csrfToken, strainId);
        } else {
            throw new Error('Failed to fetch CSRF token');
        }
    } catch (error) {
        console.error('Error fetching CSRF token:', error);
        return null;
    }
}
